# TypesBook

TypesBook is a tool for merging DocBook files. It processes XML documents using a catalog and generates the merged output.

## Installation

```bash
npm install -g typesbook
```

## Usage

```bash
typesbook -i <input-file> -o <output-file>
```

Replace `<input-file>` with the path to your input DocBook XML file and `<output-file>` with the desired path for the merged output.

## Catalog

TypesBook ships with an XML catalog containing the most common versions of OASIS DocBook DTDs and schemas. This catalog helps resolve external entities and schemas automatically, so you don't need to manually configure them.

If you need to customize the catalog or add additional entries, you can modify the catalog files in the `catalog` directory before running TypesBook.
