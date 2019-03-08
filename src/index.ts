/*
    * @license
    * Parse String to HTML
    * Version: 1.0.0
    *
    * Copyright 2019-2019 Yordan Nikolov.
    * All Rights Reserved.
    * Use, reproduction, distribution, and modification of this code is subject to the terms and
    * conditions of the MIT license, available at http://www.opensource.org/licenses/mit-license.php
    *
    * Authors: Yordan Nikolov
*/

interface TreeEntry {
  tagName?: string;
  children?: TreeEntry[];
  start: number;
  end:  number;
  content: string;
  attrs: any;
}

export default class ParseStringToHtml {
    htmlString: string = '';
    _tagExp: RegExp = new RegExp('<[\/]?(([a-z0-9]+)\s*([^>]*))>','gi');
    _attrExp: RegExp = new RegExp('((\\w+)=["|\'](.+?)["|\'])', 'gi');
    _selfClosingTagExp: RegExp = new RegExp('<([^\/>]+)\/>');
    _selfClosingTags: string[] = [
    'area',
    'base',
    'br',
    'col',
    'embed',
    'hr',
    'img',
    'input',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
    'command',
    'keygen',
    'menuitem'];
    _tree: TreeEntry[] = [];
    _key: number = 0;

    constructor (htmlString: string) {
      this.htmlString = htmlString;
      this._tree = this.buildTree(htmlString);
      console.log(this._tree)
    }

    isOpenTag(tag: string) {
      return /<(([a-z]+)\s*([^>]*))>/.test(tag);
    }

    isCloseTag(tag: string) {
      return /<\/.*?>/.test(tag);
    }

    isSelfClosingTag(tagName: string) {
      return this._selfClosingTags.indexOf(tagName) !== -1;
    }

    buildTree (str: string, tagName?: string): any {
      let tags, els = [], key = 0;

      while ((tags = this._tagExp.exec(str)) !== null) {
        if (!tagName) {
            tagName = tags[2];
        }

        if (this.isSelfClosingTag(tags[2])) {
          const el: TreeEntry = { tagName: tags[2], start: tags.index, content: "", end: null, attrs: [] };

          el.end = el.start + tags[0].length;
          el.attrs = this._collectAttributes(tags[3]);

          els.push(el);
          continue;
        }

        if (this.isOpenTag(tags[0])) {
            const el: any = { tagName: tags[2], start: tags.index, children: [], content: "", end: null, attrs: [] };
            const elContent: any = this.buildTree(str, el.tagName);

            el.children = elContent.children;
            el.end = elContent.end;
            el.content = str.slice(el.start + tags[0].length, el.end);
            el.children = el.children.concat(this._markTextContent(el));
            el.children.sort(this._sortChildren);
            el.attrs = this._collectAttributes(tags[3]);

            els.push(el);
            continue;
        }

        if (this.isCloseTag(tags[0]) && tagName === tags[2]) {
          return { children: els, end: tags.index, tagName: tagName } as TreeEntry;
        }
        
        if (this.isCloseTag(tags[0]) && tagName !== tags[2]) {
          throw new Error('Template parse errors: Unexpected closing tag "' + tagName + '"');
        }
      }

      return els;
    }

    parseToHtml (parent?: HTMLElement): DocumentFragment | HTMLElement {
      return this._parseToHtml(parent);
    }

    _parseToHtml(parent: HTMLElement | DocumentFragment, children?: TreeEntry[]) {
      let elem: any;
      children = (children || this._tree);
      parent = parent || document.createDocumentFragment();

      if (!children || !children.length) {
        return parent;
      }

      for (elem of children) {
        const domElement = elem.tagName ? document.createElement(elem.tagName) : document.createTextNode(elem.content);
        
        Object.keys(elem.attrs || {}).map((attrName) => domElement.setAttribute(attrName, elem.attrs[attrName]));
        
        parent.appendChild(domElement);

        if (elem.children && elem.children.length) {
          this._parseToHtml(domElement, elem.children)
        }
      }
    
      return parent;
    }

    _markTextContent (el: TreeEntry) {
      const text = el.content.split(/<.*>/);
      return text.filter((x) => x.length).map((x) => ({
        content: x,
        start: el.content.indexOf(x),
        end: el.content.indexOf(x) + x.length
      }));
    }

    _collectAttributes (attrStr: string = "") {
      const attrs: {[key: string]: string} = {};
      let attr: any;
      this._attrExp.lastIndex = 0;
      
      if (attrStr.length) {
        while ((attr = this._attrExp.exec(attrStr)) !== null) {
          attrs[attr[2]] = attr[3];
        }
      }
      return attrs;
    }

    _sortChildren (a: TreeEntry, b: TreeEntry) {
      return a.start > b.start ? 1 : a.start < b.start ? -1 : 0;
    }
}

