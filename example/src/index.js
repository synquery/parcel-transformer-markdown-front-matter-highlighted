import markdown1 from './web3js_quickstart.md';
import markdown2 from './web3js_providersguide.md';

const markdown = markdown2;
document.body.innerHTML = markdown.__content;
document.title = markdown.title;
