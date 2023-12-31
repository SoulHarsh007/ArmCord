import { BrowserWindow } from 'electron';
import { iconPath } from '../main.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export let splashWindow: BrowserWindow;
export async function createSplashWindow(): Promise<void> {
  splashWindow = new BrowserWindow({
    width: 300,
    height: 350,
    title: 'ArmCord',
    show: true,
    darkTheme: true,
    icon: iconPath,
    frame: false,
    backgroundColor: '#202225',
    autoHideMenuBar: true,
    webPreferences: {
      sandbox: false,
      preload: path.join(__dirname, 'preload.mjs'),
    },
  });
  splashWindow.loadURL(`file://${__dirname}/splash.html`);
}
