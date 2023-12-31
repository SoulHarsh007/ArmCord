import { BrowserWindow, app, ipcMain } from 'electron';
import * as fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { iconPath } from '../main.js';
import { Settings, getConfigLocation, setConfigBulk } from '../utils.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let setupWindow: BrowserWindow;
export function createSetupWindow(): void {
  setupWindow = new BrowserWindow({
    width: 390,
    height: 470,
    title: 'ArmCord Setup',
    darkTheme: true,
    icon: iconPath,
    frame: false,
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      spellcheck: false,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });
  ipcMain.on('saveSettings', (_event, args: Settings) => {
    console.log(args);
    setConfigBulk(args);
  });
  ipcMain.on('setup-minimize', () => {
    setupWindow.minimize();
  });
  ipcMain.on('setup-getOS', (event) => {
    event.returnValue = process.platform;
  });
  ipcMain.on('setup-quit', async () => {
    fs.unlink(getConfigLocation(), (err) => {
      if (err) throw err;

      console.log('Closed during setup. "settings.json" was deleted');
      app.quit();
    });
  });
  setupWindow.loadURL(`file://${__dirname}/setup.html`);
}
