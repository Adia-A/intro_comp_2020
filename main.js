// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const storage = require('electron-storage')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true, // protect against prototype pollution
      enableRemoteModule: false, // turn off remote
      preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('test/index.html')

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  console.log(app.getPath('userData'))
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})



// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

ipcMain.on('saveFile', (event, file) => {
  storage.set(`saveFile/${file.name}`, file.data).then(() => {
    console.log('The file was successfully written to the storage');
  })
    .catch(err => {
      console.error(err);
    });
  // Send result back to renderer process
  //win.webContents.send("fromMain", responseObj);  
})

ipcMain.on('loadFile', (event) => {
  storage.isPathExists('saveFile/currentSave.json').then(itDoes => {
    if (itDoes) {
      storage.get('saveFile/currentSave.json').then(data => {
        // Send result back to renderer process
        mainWindow.webContents.send("sendFile", data);
      })
        .catch(err => {
          console.error(err);
        });
      
    } else {
      mainWindow.webContents.send("sendFile", null);
    }
  })
})

ipcMain.on('loadHistory', (event) => {
  storage.isPathExists('saveFile/history.json').then(itDoes => {
    if (itDoes) {
      storage.get('saveFile/history.json').then(data => {
        // Send result back to renderer process
        mainWindow.webContents.send("sendHistory", data);
      })
        .catch(err => {
          console.error(err);
        });
      
    } else {
      mainWindow.webContents.send("sendHistory", null);
    }
  })
})
