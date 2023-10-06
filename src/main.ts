import { app, BrowserWindow, crashReporter, session } from 'electron';
import 'v8-compile-cache';
import path from 'path';

import {
  Settings,
  checkForDataFolder,
  checkIfConfigExists,
  firstRun,
  getConfig,
  getConfigSync,
  injectElectronFlags,
  installModLoader,
  setConfig,
  setLang,
  setWindowState,
  sleep,
} from './utils';

import './extensions/mods';
import './tray';
import {
  createCustomWindow,
  createNativeWindow,
  createTransparentWindow,
  mainWindow,
} from './window';
import { createTManagerWindow } from './themeManager/main';
import { createSplashWindow } from './splash/main';
import { createSetupWindow } from './setup/main';

export let iconPath: string;
export let settings: any;
export let customTitlebar: boolean;

app.on('render-process-gone', (event, webContents, details) => {
  if (details.reason === 'crashed') {
    app.relaunch();
  }
});

if (
  !app.requestSingleInstanceLock() &&
  getConfigSync('multiInstance') === false
) {
  app.quit();
} else {
  app.commandLine.appendSwitch('disable-features', 'WidgetLayering');
  crashReporter.start({ uploadToServer: false });

  if (
    process.platform === 'linux' &&
    process.env.XDG_SESSION_TYPE?.toLowerCase() === 'wayland'
  ) {
    app.commandLine.appendSwitch('enable-features=WebRTCPipeWireCapturer');
    console.log('Wayland detected, using PipeWire for video capture.');
  }

  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  app.commandLine.appendSwitch(
    'disable-features',
    'WinRetrieveSuggestionsOnlyOnDemand,HardwareMediaKeyHandling,MediaSessionService'
  );

  checkForDataFolder();
  checkIfConfigExists();
  injectElectronFlags();

  app.whenReady().then(async () => {
    if ((await getConfig('customIcon')) !== undefined || null) {
      iconPath = await getConfig('customIcon');
    } else {
      iconPath = path.join(__dirname, '../', '/assets/desktop.png');
    }

    async function init(): Promise<void> {
      if (!(await getConfig('skipSplash'))) {
        createSplashWindow();
      }
      if (firstRun) {
        await setLang(new Intl.DateTimeFormat().resolvedOptions().locale);
        createSetupWindow();
      }

      switch (await getConfig('windowStyle')) {
        case 'native':
          createNativeWindow();
          break;
        case 'transparent':
          createTransparentWindow();
          break;
        default:
          createCustomWindow();
          customTitlebar = true;
          break;
      }
    }

    await init();
    await installModLoader();

    session
      .fromPartition('some-partition')
      .setPermissionRequestHandler((_webContents, permission, callback) => {
        if (permission === 'notifications' || permission === 'media') {
          callback(true);
        }
      });

    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await init();
      }
    });

    // Handle command-line arguments
    let argNum = 2;
    if (process.argv[0] === 'electron') {
      argNum++;
    }
    const args = process.argv[argNum];
    if (args && !args.startsWith('--')) {
      switch (args) {
        case 'themes':
          createTManagerWindow();
          break;
        case 'keybinds':
          createKeybindWindow();
          break;
        default:
          if (args.includes('=')) {
            const [key, value] = args.split('=');
            await setConfig(key as keyof Settings, value);
            console.log(`Setting ${key} to ${value}`);
            app.relaunch();
            app.exit();
          }
          break;
      }
    }
  });
}
