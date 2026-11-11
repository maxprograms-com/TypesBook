import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
    Catalog,
    DOMBuilder,
    GrammarCache,
    SAXParser,
    TextNode,
    XMLAttribute,
    XMLDocument,
    XMLElement,
    XMLNode,
    XMLWriter
} from "typesxml";

const XINCLUDE: string = "xi:include";

export class TypesBookMerger {

    private catalog: Catalog;
    private readonly ids: Set<string> = new Set<string>();
    private readonly grammarCache: GrammarCache = new GrammarCache();
    private parsedFiles: Set<string>;

    public constructor(catalogFile: string) {
        let catalogFileResolved = resolve(catalogFile);
        this.catalog = new Catalog(catalogFileResolved);
        this.parsedFiles = new Set<string>();
    }

    public merge(inputFile: string, outputFile: string): void {
        const input: string = resolve(inputFile);
        const output: string = resolve(outputFile);
        if (!existsSync(input)) {
            throw new Error("Input file not found: " + input);
        }

        console.log("Input:  " + input);
        console.log("Output: " + output);
        const document: XMLDocument = this.parse(input);
        const root: XMLElement | undefined = document.getRoot();
        if (!root) {
            throw new Error("Input file has no document element: " + input);
        }

        this.expandIncludes(root, dirname(input));
        this.harvestIds(root);
        this.resolveLinks(root);

        XMLWriter.writeDocument(document, output);
        console.log("Generated: " + output);
    }

    private parse(file: string): XMLDocument {
        if (this.parsedFiles.has(file)) {
            throw new Error('Circular include detected: ' + file);
        }
        console.log("Processing: " + file);
        const builder: DOMBuilder = new DOMBuilder();
        const parser: SAXParser = new SAXParser();
        parser.setContentHandler(builder);
        parser.setCatalog(this.catalog);
        parser.setGrammarCache(this.grammarCache);
        parser.parseFile(file);
        const document: XMLDocument | undefined = builder.getDocument();
        if (!document) {
            throw new Error("Unable to parse XML document: " + file);
        }
        this.parsedFiles.add(file);
        return document;
    }

    private expandIncludes(element: XMLElement, folder: string): void {
        const content: XMLNode[] = element.getContent();
        for (let index: number = 0; index < content.length; index++) {
            const node: XMLNode = content[index];
            if (!(node instanceof XMLElement)) {
                continue;
            }

            if (node.getName() === XINCLUDE) {
                const href: string | undefined = node.getAttribute("href")?.getValue();
                if (!href) {
                    throw new Error("xi:include is missing its href attribute");
                }
                if (node.getAttribute("parse")?.getValue() === "text") {
                    throw new Error("Text xi:include is not supported: " + href);
                }

                const includedFile: string = resolve(folder, href);
                const includedDocument: XMLDocument = this.parse(includedFile);
                const includedRoot: XMLElement | undefined = includedDocument.getRoot();
                if (!includedRoot) {
                    throw new Error("Included file has no document element: " + includedFile);
                }
                this.expandIncludes(includedRoot, dirname(includedFile));
                content[index] = includedRoot;
                continue;
            }

            this.expandIncludes(node, folder);
        }
        element.setContent(content);
    }

    private harvestIds(element: XMLElement): void {
        let id: string | undefined = element.getAttribute("id")?.getValue();
        if (!id) {
            id = element.getAttribute("xml:id")?.getValue();
        }
        if (id) {
            this.ids.add(id);
        }
        const children: XMLElement[] = element.getChildren();
        for (const child of children) {
            this.harvestIds(child);
        }
    }

    private resolveLinks(element: XMLElement): void {
        const content: XMLNode[] = element.getContent();
        for (let index: number = 0; index < content.length; index++) {
            const node: XMLNode = content[index];
            if (!(node instanceof XMLElement)) {
                continue;
            }

            if (node.getName() === "olink") {
                const target: string = node.getAttribute("targetptr")?.getValue() ?? "";
                const replacement: XMLElement = new XMLElement(this.ids.has(target) ? "link" : "remark");
                if (this.ids.has(target)) {
                    replacement.setAttribute(new XMLAttribute("linkend", target));
                }
                replacement.setContent(this.withoutLinkTextNewlines(node.getContent()));
                if (replacement.getText().trim().length === 0) {
                    if (this.ids.has(target)) {
                        console.warn(
                            "Empty link: " + replacement.toString() + "\nfrom: " + node.toString()
                        );
                    } else {
                        console.warn("Empty remark: " + node.toString());
                    }
                }
                content[index] = replacement;
                continue;
            }

            this.resolveLinks(node);
        }
        element.setContent(content);
    }

    private withoutLinkTextNewlines(content: XMLNode[]): XMLNode[] {
        return content.map((node: XMLNode): XMLNode => {
            if (node instanceof TextNode) {
                node.setValue(node.getValue().replace(/\n/g, ""));
            }
            return node;
        });
    }
}
