"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  getEnv: (name) => electron.ipcRenderer.invoke("get-env", name),
  showMessage: (message) => electron.ipcRenderer.send("show-message", message),
  contribute: (projectName, epochs, zipFilePath) => electron.ipcRenderer.invoke("contribute", projectName, epochs, zipFilePath),
  onConsoleOutput: (callback) => electron.ipcRenderer.on("console-output", (_, data) => callback(data))
});
electron.contextBridge.exposeInMainWorld("ipcRenderer", {
  on(...args) {
    const [channel, listener] = args;
    return electron.ipcRenderer.on(channel, (event, ...args2) => listener(event, ...args2));
  },
  off(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.off(channel, ...omit);
  },
  send(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.send(channel, ...omit);
  },
  invoke(...args) {
    const [channel, ...omit] = args;
    return electron.ipcRenderer.invoke(channel, ...omit);
  }
  // You can expose other APTs you need here.
  // ...
});
