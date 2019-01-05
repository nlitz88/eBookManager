'use strict';
const {app, BrowserWindow, ipcMain} = require("electron");

// TEMPORARY DELETE
//require('electron-reload')(__dirname);

app.on("ready", () => {


    // instantiate new electron BrowserWindow
    let win = new BrowserWindow({
        width: 1000,
        height: 600,
        resizable: false,
        show: false
    });


    // load the the index html file in the renderer process
    win.loadURL(`file://${__dirname}/index.html`);
    // once the file has loaded everything, then show the window
    win.once("ready-to-show", () => {
        win.show();
    });


});


// if all of the instances have been closed, kill the app
app.on("window-all-closed", () => {app.quit()});