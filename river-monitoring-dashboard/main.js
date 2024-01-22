const { app, BrowserWindow, Menu } = require('electron');
const path = require('node:path');

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 520,
    minWidth: 900, // Set the minimum width
    minHeight: 520, // Set the minimum height
    maxWidth: 1200, // Set the maximum width
    maxHeight: 600, // Set the maximum height
    resizable: true, // Allow window resizing
    icon: path.join(__dirname, 'logo.png'), // Set the path to your PNG icon file
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // Create an empty menu
  const menu = Menu.buildFromTemplate([]);

  // Set the menu to null to remove the application menu
  Menu.setApplicationMenu(menu);

  // Open the DevTools if needed
  // mainWindow.webContents.openDevTools()
}

// Rest of your code remains unchanged
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});
