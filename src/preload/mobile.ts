import { addStyle } from '../utils.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function injectMobileStuff(): void {
  document.addEventListener('DOMContentLoaded', function () {
    const mobileCSS = path.join(__dirname, '../', '/content/css/mobile.css');
    addStyle(fs.readFileSync(mobileCSS, 'utf8'));
    // TO-DO: clicking on the logo, or additional button triggers ESC button to move around the UI quicker
    // var logo = document.getElementById("window-title");
    // logo!.addEventListener("click", () => {
    //
    // });
  });
}
