ParseStringToHtml
====================

The ParseStringToHtml class provides the ability to parse HTML source code from a string into a DOM Document.

## Basic Usage

```javascript
const rootEl = document.getElementById('root');
const htmlString = `
    <h2>Hallo world from H2</h2>
    <p>The ParseStringToHtml class provides the ability to parse HTML source code from a string into a DOM Document.</p>
`;

const str2html = new ParseStringToHtml(htmlString);
str2html.parseToHtml(rootEl);

// or
const dom = str2html.parseToHtml();
rootEl.appendChild(dom);
```