#!/usr/bin/env node

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { TypesBookMerger } from "./typesbook.js";

export class TypesBookCli {
    private readonly catalogFile: string = resolve(
        dirname(fileURLToPath(import.meta.url)),
        "../catalog/catalog.xml"
    );

    public run(arguments_: string[]): number {
        try {
            const { values } = parseArgs({
                args: arguments_,
                options: {
                    help: {
                        type: "boolean",
                        short: "h"
                    },
                    input: {
                        type: "string",
                        short: "i"
                    },
                    output: {
                        type: "string",
                        short: "o"
                    }
                },
                strict: true
            });

            if (values.help) {
                console.log(this.usage());
                return 0;
            }

            const input = values.input;
            const output = values.output;
            if (typeof input !== "string" || typeof output !== "string") {
                console.error(this.usage());
                return 1;
            }

            new TypesBookMerger(this.catalogFile).merge(input, output);
            return 0;
        } catch (error) {
            console.error(error instanceof Error ? error.message : error);
            return 1;
        }
    }

    private usage(): string {
        return "Usage: typesbook -i input_file -o output_file";
    }
}

process.exitCode = new TypesBookCli().run(process.argv.slice(2));
