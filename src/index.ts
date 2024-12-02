import path from 'node:path';
import { Transformer } from '@parcel/plugin';
import { marked, type MarkedOptions, type MarkedExtension } from 'marked';
import { loadFront } from 'yaml-front-matter';
import hljs from 'highlight.js';
import prism from './prism.js';
// npm install prismjs でのパッケージインストールでは languages が不足するので、サイトからダウンロードして保持すること
// prism.js は全言語対応で OK、CSS は限定的にして軽量にしておくこと。
import jsdom from 'jsdom';

export default new Transformer({
  async loadConfig({ config }) {
    // @ts-ignore
    const conf = {
      marked: await config.getConfig([
        '.markedrc',
        '.markedrc.js',
        'marked.config.js',
      ]),
      highlighted: await config.getConfig([
        '.hlrc',
        '.hlrc.js',
        'hl.config.js',
      ]),
    };
    const defaultConfig = {
      marked: {
        breaks: true,
        pedantic: false,
        gfm: true
      },
      highlighted: {
        className: ''
      },
      templated: {
        note: {
          template: `<div class="noteBlockContainer theme-block theme-note-block alert alert--secondary">
            <div class="noteBlockHeading">
              <span class="noteBlockIcon"><svg viewBox="0 0 14 16"><path fill-rule="evenodd" d="M6.3 5.69a.942.942 0 0 1-.28-.7c0-.28.09-.52.28-.7.19-.18.42-.28.7-.28.28 0 .52.09.7.28.18.19.28.42.28.7 0 .28-.09.52-.28.7a1 1 0 0 1-.7.3c-.28 0-.52-.11-.7-.3zM8 7.99c-.02-.25-.11-.48-.31-.69-.2-.19-.42-.3-.69-.31H6c-.27.02-.48.13-.69.31-.2.2-.3.44-.31.69h1v3c.02.27.11.5.31.69.2.2.42.31.69.31h1c.27 0 .48-.11.69-.31.2-.19.3-.42.31-.69H8V7.98v.01zM7 2.3c-3.14 0-5.7 2.54-5.7 5.68 0 3.14 2.56 5.7 5.7 5.7s5.7-2.55 5.7-5.7c0-3.15-2.56-5.69-5.7-5.69v.01zM7 .98c3.86 0 7 3.14 7 7s-3.14 7-7 7-7-3.12-7-7 3.14-7 7-7z"></path></svg></span>
              <span class="noteBlockTitle"> note </span>
            </div>
            <div class="noteBlockContent">
              <p>    </p><!-- 挿入位置 -->
            </div>
          </div>`
        },
        code: {
          template: `<div class="codeBlockContainer theme-block theme-code-block">
            <div class="codeBlockHeading"><span class="codeBlockTitle"> </div></div>
            <div class="codeBlockContent">
              <div> </div><!-- 挿入位置 -->
              <div class="buttonGroup">
                <button type="button" class="clean-btn" aria-label="Toggle word wrap" title="Toggle word wrap">
                  <svg viewBox="0 0 24 24" class="wordWrapButtonIcon" aria-hidden="true"><path fill="currentColor" d="M4 19h6v-2H4v2zM20 5H4v2h16V5zm-3 6H4v2h13.25c1.1 0 2 .9 2 2s-.9 2-2 2H15v-2l-3 3l3 3v-2h2c2.21 0 4-1.79 4-4s-1.79-4-4-4z"></path></svg>
                </button>
                <button type="button" aria-label="Copy code to clipboard" title="Copy" class="clean-btn"><span class="copyButtonIcons" aria-hidden="true">
                  <svg viewBox="0 0 24 24" class="copyButtonIcon"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg>
                  <svg viewBox="0 0 24 24" class="copyButtonSuccessIcon"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg>
                </span></button>
              </div>
            </div>
          </div>`
        }
      },
      extensions: [],
    };
    ['marked', 'highlighted'].forEach(k=>{
      if (!conf[ k ]) {
        return;
      }
      let isJavascript = path.extname(conf[ k ].filePath) === '.js';
      if (isJavascript) {
        config.invalidateOnStartup();
      }
      Object.assign(defaultConfig[ k ], conf[ k ].contents as any);
    });
    return defaultConfig;
    
  },
  async transform({ asset, config }) {
    const code = await asset.getCode();
    const fm = loadFront(code);
    const option: { 
      content?: MarkedOptions, 
      marked?: Object, 
      highlighted?: Object,
      templated?: Object,
      extensions?: MarkedExtension[]
    } = config || { };
    option.extensions?.forEach((extension) => {
      marked.use(extension);
    })
    const result = { ...fm };
    let str = result.__content;
    if (option.marked) {
      str = result.__marked = marked.parse(str, { ...option.marked });
    }
    const win = (new jsdom.JSDOM(str)).window, doc = win.document;
    Array.from(doc.body.querySelectorAll('pre code,div.code')).forEach((el, i)=>{

      const clsary = el.className.split(' ');
      const clsadd = option.highlighted && option.highlighted.className;
      let addEl;
      switch(el.tagName) {
        case 'DIV':
          addEl = el;
          break;
        case 'PRE': default:
          addEl = el.parentNode;
      }
      if(clsadd) addEl.className += ` ${clsadd}`;

      const language = (clsary.map(n=>n.split('-')).filter(p=>p[0] == 'language' &&  !!prism.languages[p[1]])[0] || [ ])[1];
      // hljs.highlightElement(el);
      if(!language) { 
        return el.setAttribute('data-prismjs-error', `queryIndex:${i}`);
      }
      // highlight 関数は &lt; &gt; を escape してしまうので、元の文字に変更する。
      let fixHTML = el.innerHTML.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
      el.innerHTML = prism.highlight(fixHTML, prism.languages[language], language);
      
    });
    result.__content = trippleCollonBlock(doc.body.innerHTML);
    asset.type = 'js';
    asset.setCode(`export default ${JSON.stringify(result)}`);
    return [asset];
    function trippleCollonBlock(t: string) {
      const a = t.split(/:::/);
      if(a.length == 1) return a[0]; // No tripple collon block
      let blocked = '', blockType;
      for(let i = 0; i<= a.length; i++) {
        if(blockType == null) {
          blockType = a[i].slice(-4);
          blocked += a[i].slice(0, -4);
          continue;
        }
        const tpl = option.templated[ blockType ];
        if(tpl) {
          const win = (new jsdom.JSDOM(tpl.template)).window, doc = win.document;
          const insEl = doc.body.querySelector(`.${blockType}BlockContent`);
          if(insEl) (insEl.children.length ? insEl.children[0]: insEl).innerHTML = a[i];
          blocked += doc.body.innerHTML;
          blockType = null;
          continue;
        }
        blocked += a[i];
      }
      return blocked;
    }
  },
});
