# TypesBook

[![npm version](https://img.shields.io/npm/v/typesbook)](https://www.npmjs.com/package/typesbook)
[![npm license](https://img.shields.io/npm/l/typesbook)](LICENSE)
[![TypeScript](https://img.shields.io/badge/implementation-native%20TypeScript-3178c6)](https://www.typescriptlang.org/)

TypesBook is a tool for merging DocBook files. It processes XML documents using a catalog and generates the merged output.

## Installation

```bash
npm install -g typesbook
```

## Command-line usage

```bash
typesbook -i <input-file> -o <output-file>
```

Replace `<input-file>` with the path to your input DocBook XML file and `<output-file>` with the desired path for the merged output.

## Library usage

TypesBook can also be used from a TypeScript or JavaScript application:

```bash
npm install typesbook
```

```typescript
import { TypesBookMerger } from "typesbook";

const merger = new TypesBookMerger("/path/to/catalog.xml");
merger.merge("input.xml", "output.xml");
```

`TypesBookMerger` requires the path to an XML catalog when it is created. The `merge` method expands `xi:include` elements, resolves links, and writes the merged document to the output path.

## Catalog

TypesBook ships with an XML catalog containing the most common versions of OASIS DocBook DTDs and schemas. This catalog helps resolve external entities and schemas automatically, so you don't need to manually configure them.

If you need to customize the catalog or add additional entries, you can modify the catalog files in the `catalog` directory before running TypesBook.
