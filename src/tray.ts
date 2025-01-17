import {
  Menu,
  MessageBoxOptions,
  Tray,
  app,
  dialog,
  nativeImage,
} from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { createSettingsWindow } from './settings/main';
import {
  getConfig,
  getConfigLocation,
  getDisplayVersion,
  setConfig,
} from './utils';
import { createInviteWindow, mainWindow } from './window';
export let tray: any = null;
let trayIcon = 'ac_plug_colored';
app.whenReady().then(async () => {
  let finishedSetup = getConfig('doneSetup');
  if (getConfig('trayIcon') != 'default') {
    trayIcon = getConfig('trayIcon');
  }
  let trayPath = nativeImage.createFromPath(
    path.join(__dirname, '../', `/assets/${trayIcon}.png`)
  );
  let trayVerIcon;
  trayVerIcon = function () {
    return trayPath.resize({ height: 24 });
  };

  if (getConfig('tray')) {
    let clientName = getConfig('clientName') ?? 'ArmCord';
    tray = new Tray(trayPath);
    if (finishedSetup === false) {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: `Finish the setup first!`,
          enabled: false,
        },
        {
          label: `Quit ${clientName}`,
          async click() {
            fs.unlink(getConfigLocation(), (err) => {
              if (err) throw err;

              console.log('Closed during setup. "settings.json" was deleted');
              app.quit();
            });
          },
        },
      ]);
      tray.setContextMenu(contextMenu);
    } else {
      const contextMenu = Menu.buildFromTemplate([
        {
          label: `${clientName} ${getDisplayVersion()}`,
          icon: trayVerIcon(),
          enabled: false,
        },
        {
          type: 'separator',
        },
        {
          label: `Open ${clientName}`,
          click() {
            mainWindow.show();
          },
        },
        {
          label: 'Open Settings',
          click() {
            createSettingsWindow();
          },
        },
        {
          label: 'Support Discord Server',
          click() {
            createInviteWindow('TnhxcqynZ2');
          },
        },
        {
          type: 'separator',
        },
        {
          label: `Quit ${clientName}`,
          click() {
            app.quit();
          },
        },
      ]);
      tray.setContextMenu(contextMenu);
    }
    tray.setToolTip(clientName);
    tray.on('click', function () {
      mainWindow.show();
    });
  } else if (getConfig('tray') == undefined) {
    const options: MessageBoxOptions = {
      type: 'question',
      buttons: ['Yes, please', "No, I don't"],
      defaultId: 1,
      title: 'Tray icon choice',
      message: `Do you want to use tray icons?`,
      detail:
        'Linux may not work well with tray icons. Depending on your system configuration, you may not be able to see the tray icon. Enable at your own risk. Can be changed later.',
    };

    dialog.showMessageBox(mainWindow, options).then(({ response }) => {
      if (response == 0) {
        setConfig('tray', true);
      } else {
        setConfig('tray', false);
      }
      app.relaunch();
      app.exit();
    });
  }
});
