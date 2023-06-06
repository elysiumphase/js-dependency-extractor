<h1 align="center">js-dependency-extractor</h1>

<p align="center">
  A JavaScript and TypeScript files dependency extractor.
<p>

# Table of Contents

- [Table of Contents](#table-of-contents)
- [Presentation](#presentation)
- [Installation](#installation)
- [Technical information](#technical-information)
  - [Stack](#stack)
  - [Tests](#tests)
    - [Code quality](#code-quality)
    - [Unit](#unit)
  - [Logging and debugging](#logging-and-debugging)
  - [Security](#security)
- [Requirements](#requirements)
  - [Production](#production)
  - [Development](#development)
- [Usage](#usage)
  - [Lib](#lib)
    - [Import](#import)
    - [jsDependencyExtractor(options)](#jsdependencyextractoroptions)
  - [CLI](#cli)
    - [Command name](#command-name)
    - [Options](#options)
    - [Print](#print)
    - [Example](#example)
  - [Environment variables](#environment-variables)
  - [Errors](#errors)
    - [Object structure](#object-structure)
    - [Codes](#codes)
  - [Development](#development-1)
    - [Test](#test)
      - [Linting](#linting)
      - [Unit](#unit-1)
- [Code of Conduct](#code-of-conduct)
- [Contributing](#contributing)
- [Support](#support)
- [Security](#security-1)
- [License](#license)

# Presentation

The purpose of this project is to extract JavaScript and TypeScript dependencies from a project directory or a single file.

# Installation

To use as a library:

`npm i -S js-dependency-extractor`

To use as a CLI tool:

`npm i -g js-dependency-extractor`

# Technical information

## Stack

- NodeJS >= Dubnium 10.17.0 with NPM >=6.11.3

## Tests

### Code quality

Code style follows [Airbnb JavaScript Best Practices](https://github.com/airbnb/javascript) using ESLint.

### Unit

Mocha and Chai.

## Logging and debugging

Uses [bugbug](https://github.com/elysiumphase/bugbug) for debugging.

## Security

- [Code security](https://docs.npmjs.com/packages-and-modules/securing-your-code) and most precisely module dependencies can be audited running `npm audit`.

# Requirements

## Production

- See [Stack](#stack)

## Development

- See [Stack](#stack)

# Usage

## Lib

### Import

```javascript
const jsDependencyExtractor = require('js-dependency-extractor');
```

*js-dependency-extractor* module exports a function named `jsDependencyExtractor`.

- `jsDependencyExtractor` **<AsyncFunction\>**.

### jsDependencyExtractor(options)

Extract JavaScript and TypeScript dependencies from a directory or a file.

**Note**:

- support recursive extracting;
- support scoped dependencies;
- can merge partial requires/imports into one same dependency;
- can ignore specified paths;
- can target specific file extensions.

<br/>

- `options` **<Object\>**
  - `path` **<String\>** Path to directory or file. Could be absolute or relative. *Default*: `none` *Required*: `true`
  - `ignorePaths` **<Array\>** Paths to ignore. Could be absolute, relative or a pattern. *Default*: `none` *Required*: `false`
  - `mergePartial` **<Boolean\>** Whether to merge partial requires/imports into one same dependency. *Default*: `false` *Required*: `false`
  - `onlyExtensions` **<Array\>** File extensions to watch for. Empty list or null values mean to look up into all file extensions. *Default*: `none` *Required*: `false`
- Returns: **<Array\>** Alphabetically ordered list of dependencies (empty array if no dependency found)

<br/>

**Example**:

```javascript
// my-project/app/index.ts
import path from 'path';
import memwatch from '@airbnb/node-memwatch';
import partial from '@scope/example-lib/partial';
import uuidv1 from 'uuid/v1';
import uuidv4 from 'uuid/v4';
import helpers from './helpers';
// ...
```

```javascript
// my-project/app/helpers/index.js
const path = require('path');
const partial = require('@scope/example-lib/partial');
const sharp = require('sharp');
// ...
```

```javascript
// my-project/test/helpers/index.js
const chai = require('chai');
const helpers = require('../app/helpers');
// ...
```

```javascript
// example 1
try {
  const dependencies = await jsDependencyExtractor({
    ignorePaths: ['node_modules'],
    mergePartial: false,
    onlyExtensions: ['.ts'],
    path: '../../my-project',
  });

  console.log(dependencies);

  // [
  //   '@airbnb/node-memwatch',
  //   '@scope/example-lib/partial',
  //   'path',
  //   'uuid/v1',
  //   'uuid/v4'
  // ]
} catch (e) {
  console.error(e);
}
```

```javascript
// example 2
try {
  const dependencies = await jsDependencyExtractor({
    ignorePaths: ['my-project/test', 'node_modules'],
    mergePartial: true,
    onlyExtensions: ['.js', '.ts'],
    path: '../../my-project',
  });

  console.log(dependencies);

  // [
  //   '@airbnb/node-memwatch',
  //   '@scope/example-lib',
  //   'path',
  //   'sharp',
  //   'uuid'
  // ]
} catch (e) {
  console.error(e);
}
```

## CLI

Extract JavaScript and TypeScript dependencies from a directory or a file using the command line interface.

See [jsDependencyExtractor(options)](#jsdependencyextractoroptions) for more details.

### Command name

`jsde`

### Options

- `-p, --path <path>` Path to directory or file. Could be absolute or relative. *Default*: `none` *Required*: `true`
- `-d, --debug` Output extra debugging. *Default*: `false` *Required*: `false`
- `-e, --only-extensions [onlyExtensions...]` File extensions to watch for separated by a white space. Empty list or null values mean to look up into all file extensions. *Default*: `none` *Required*: `false`
- `-i, --ignore-paths [ignorePaths...]` Paths to ignore separated by a white space. Could be absolute, relative or a pattern. *Default*: `none` *Required*: `false`
- `-m, --merge-partial` Whether to merge partial requires/imports into one same dependency. *Default*: `false` *Required*: `false`
- `-v, --version` Output the current version. *Default*: `none` *Required*: `false`

### Print

Alphabetically ordered list of dependencies on stdout.

### Example

Based on [jsDependencyExtractor(options)](#jsdependencyextractoroptions) example.

```shell
jsde -p ../../my-project -e .js .ts -i my-project/test .node_modules -m

# print
@airbnb/node-memwatch
@scope/example-lib
path
sharp
uuid
```

## Environment variables

| name | type | description | default | example |
| :--- | :--- | :---------- | :------ | :------ |
| **DEBUG** | Debug | Debug mode. See [bugbug](https://github.com/elysiumphase/bugbug). | none | `js-dependency-extractor:*` |

**\*required**

## Errors

### Object structure

Errors emitted by *js-dependency-extractor* extend native Error:

```javascript
{
  name,
  code,
  message,
  stack,
}
```

### Codes

| name | code | description | module |
| ---- | ---- | ----------- | ------ |
| DependencyExtractionError | `dependency-extraction-error` | Dependency extraction encountered an error | src/index |

## Development

### Test

#### Linting

`npm run lint`

#### Unit

`npm run test`

# Code of Conduct

This project has a [Code of Conduct](.github/CODE_OF_CONDUCT.md). By interacting with this repository, organization, or community you agree to abide by its terms.

# Contributing

Please have a look at our [TODO](TODO.md) for any work in progress.

Please take also a moment to read our [Contributing Guidelines](.github/CONTRIBUTING.md) if you haven't yet done so.

# Support

Please see our [Support](.github/SUPPORT.md) page if you have any questions or for any help needed.

# Security

For any security concerns or issues, please visit our [Security Policy](.github/SECURITY.md) page.

# License

[MIT](LICENSE.md).
