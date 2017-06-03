require('electron-reload')(__dirname, {
  electron: require('electron'),
});
const path = require('path');
const fs = require('fs');
const electron = require('electron');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const dialog = electron.dialog;
const Menu = electron.Menu;
let mainWindow = null;


const dockTemplate = [
  {
    label: 'Open...',
    accelerator: 'CmdOrCtrl+O',
        click() { openFile(); }, //eslint-disable-line
  },
  {
    label: 'Save...',
    accelerator: 'CmdOrCtrl+S',
    click() {
      mainWindow.webContents.send('save-file');
    },
  },
];

const template = [
  {
    label: 'File',
    submenu: [
      {
        label: 'Open...',
        accelerator: 'CmdOrCtrl+O',
        click() { openFile(); }, //eslint-disable-line
      },
      {
        label: 'Save...',
        accelerator: 'CmdOrCtrl+S',
        click() {
          mainWindow.webContents.send('save-file');
        },
      },
      {
        label: 'Copy HTML',
        accelerator: 'Shift+CmdOrCtrl+C',
        click() {
          mainWindow.webContents.send('copy-html');
        },
      },
      {
        label: 'Save HTML',
        accelerator: 'Shift+CmdOrCtrl+S',
        click() {
          mainWindow.webContents.send('save-html');
        },
      },
      {
        label: 'Save Markdown',
        click() {
          mainWindow.webContents.send('save-md');
        },
      },
      {
        label: 'Show in Finder',
        click() {
          mainWindow.webContents.send('show-in-file-system');
        },
      },
      {
        label: 'Open in Default Editor',
        click() {
          mainWindow.webContents.send('open-in-default-editor');
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        label: 'Undo',
        accelerator: 'CmdOrCtrl+Z',
        role: 'undo',
      },
      {
        label: 'Redo',
        accelerator: 'Shift+CmdOrCtrl+Z',
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        label: 'Cut',
        accelerator: 'CmdOrCtrl+X',
        role: 'cut',
      },
      {
        label: 'Copy',
        accelerator: 'CmdOrCtrl+C',
        role: 'copy',
      },
      {
        label: 'Paste',
        accelerator: 'CmdOrCtrl+V',
        role: 'paste',
      },
      {
        label: 'Select All',
        accelerator: 'CmdOrCtrl+A',
        role: 'selectall',
      },
    ],
  },
  {
    label: 'Developer',
    submenu: [
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin'
          ? 'Alt+Command+I'
          : 'Ctrl+Shift+I',
        click() { mainWindow.webContents.toggleDevTools(); },
      },
    ],
  },
];

if (process.platform === 'darwin') {
  const name = app.getName();
  template.unshift({
    label: name,
    submenu: [
      {
        label: `About ${name}`,
        role: 'about',
      },
      {
        type: 'separator',
      },
      {
        label: 'Services',
        role: 'services',
        submenu: [],
      },
      {
        type: 'separator',
      },
      {
        label: `Hide ${name}`,
        accelerator: 'Command+H',
        role: 'hide',
      },
      {
        label: 'Hide Others',
        accelerator: 'Command+Alt+H',
        role: 'hideothers',
      },
      {
        label: 'Show All',
        role: 'unhide',
      },
      {
        type: 'separator',
      },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click() { app.quit(); },
      },
    ],
  });
}

function openFile() {
  const files = dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'txt'] },
    ],
  });

  if (!files) return;

  const file = files[0];
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);
  mainWindow.webContents.send('file-opened', file, content);
  fs.watchFile(file, () => {
    mainWindow.send('file-changed', fs.readFileSync(file).toString());
  });
}

function getFileContent(file) {
  const content = fs.readFileSync(file).toString();
  app.addRecentDocument(file);
  mainWindow.webContents.send('file-opened', file, content);
}


function saveFile(content) {
  const fileName = dialog.showSaveDialog(mainWindow, {
    title: 'Save HTML Output',
    defaultPath: app.getPath('desktop'),
    filters: [
      { name: 'HTML Files', extensions: ['html'] },
    ],
  });

  if (!fileName) return;

  fs.writeFileSync(fileName, content);
}


function saveMarkdown(content) {
  const fileName = dialog.showSaveDialog(mainWindow, {
    title: 'Save Mardown Output',
    defaultPath: app.getPath('desktop'),
    filters: [
      { name: 'Markdown Files', extensions: ['md'] },
    ],
  });

  if (!fileName) return;

  fs.writeFileSync(fileName, content);
}

app.on('open-file', (event, file) => {
  const content = fs.readFileSync(file).toString();
  mainWindow.webContents.send('file-opened', file, content);
})
;
app.on('ready', () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
  app.dock.setMenu(Menu.buildFromTemplate(dockTemplate));
  mainWindow = new BrowserWindow({ width: 1000, height: 800 });
  mainWindow.webContents.openDevTools();
  mainWindow.loadURL(`file://${path.join(__dirname, 'index.html')}`);
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
});

exports.openFile = openFile;
exports.saveFile = saveFile;
exports.saveMarkdown = saveMarkdown;
exports.getFileContent = getFileContent;
