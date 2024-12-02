# parcel-transformer-markdown-front-matter-highlighted


[![NPM Downloads](https://img.shields.io/npm/dm/@synquery/parcel-transformer-markdown-front-matter-highlighted.svg?style=flat)](https://www.npmjs.com/package/@synquery/parcel-transformer-markdown-front-matter-highlighted)
[![Build & Deploy](https://github.com/synquery/parcel-transformer-markdown-front-matter-highlighted/actions/workflows/ci.yml/badge.svg)](https://github.com/synquery/parcel-transformer-markdown-front-matter-highlighted/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/@synquery/parcel-transformer-markdown-front-matter-highlighted.svg)](https://www.npmjs.com/package/@synquery/parcel-transformer-markdown-front-matter-highlighted)

A [**`Parcel 2`**](https://parceljs.org/) plugin to load markdown file with YAML Front matter and code whitch is want to highlighted. It uses [Marked][https://www.npmjs.com/package/marked] and [Prism.js](https://prismjs.com/) to render markdown.


## Demonstration

```bash
npm i yarn # If you don't have
git cline git@github.com:synquery/parcel-transformer-markdown-front-matter-highlighted.git
cd parcel-transformer-markdown-front-matter-highlighted
yarn install
yarn build
yarn serve-example # => http://localhost:1234 provides the transform result of example/web3js_quickstart.md .
```

## Usage

Install the plugin

```bash
npm i @synquery/parcel-transformer-markdown-front-matter-highlighted --save-dev
```
or
```
yarn add @synquery/parcel-transformer-markdown-front-matter-highlighted --dev
```

Add `@synquery/parcel-transformer-markdown-front-matter-highlighted` transformer to the `.parcelrc`

```js
{
  "extends": "@parcel/config-default",
  "transformers": {
    "*.md": [ "@synquery/parcel-transformer-markdown-front-matter-highlighted" ]
  }
}
```

!! CAUTION !! Parcel2 should specify multiple extentions if you set key with bracket: "{ }".

❌ Not working
```js
  "transformers": {
    "*.{md}": [ "@synquery/parcel-transformer-markdown-front-matter-highlighted" ]
  }
```

⭕️ working
```js
  "transformers": {
    "*.{md,markdown}": [ "@synquery/parcel-transformer-markdown-front-matter-highlighted" ]
  }
```

`mydoc.md`:

```markdown
---
title: Web3.js
sidebar_position: 1
sidebar_label: 'Mastering Providers'
---
\`\`\`typescript title='IPC, HTTP and WS provider'
import { Web3 } from 'web3';
import { IpcProvider } from 'web3-providers-ipc';

// highlight-next-line
// IPC provider
const web3 = new Web3(new IpcProvider('/Library/Ethereum/geth.ipc'));
\`\`\`
```

**Output HTML string**

Import your markdown file, and get the HTML content and the yaml front matter properties.

```js
import file from './mydoc.md';
document.body.innerHTML = file.__content;
```

**Output Markdown string**

```js
// .markedrc
{
  "marked": false
}
```

```js
import file from './mydoc.md';
document.body.innerHTML = file.__content; // => Output Markdown string.
```

## Configuration

[Marked](https://github.com/markedjs/marked) can be configured using a `.markedrc`, `.markedrc.js`, or `marked.config.js` file. See the [Marked API Reference](https://marked.js.org/using_advanced#options) for details on the available options.

> Note: `.markedrc.js` and `marked.config.js` are supported for JavaScript-based configuration, but should be avoided when possible because they reduce the effectiveness of Parcel's caching. Use a JSON based configuration format (e.g. `.markedrc`) instead.

There is a `marked` configuration that converts `markdown` to `HTML`. Otherwise just read the `markdown` string.

```js
{
  "marked": {
    "breaks": true,
    "pedantic": false,
    "gfm": true
  }
}
```

### Marked extensions

To use [marked extensions](https://marked.js.org/using_advanced#extensions), you must use a javascript configuration file. Install your extensions and instanciate in the configuration.

```javascript
/// .markedrc.js
const { gfmHeadingId } = require('marked-gfm-heading-id');

module.exports = {
 extensions: [gfmHeadingId({ prefix: 'test-' })],
};
```

## License

MIT

© 2024 [Synquery Team](https://synquery.org)

forked from:
© 2024 François de Metz
© 2022 [Kenny Wong](https://wangchujiang.com)

[marked]: https://marked.js.org/
[prism.js]: https://prismjs.com/
