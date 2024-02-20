import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  openDirectory: () => ipcRenderer.invoke('dialog:openDirectory'),
  openExeFile: () => ipcRenderer.invoke('dialog:openExeFile'),
  showItemInFolder: (path) => ipcRenderer.send('shell:showItemInFolder', path),
  openPath: (path) => ipcRenderer.send('shell:openPath', path),
  starExe: (path) => ipcRenderer.invoke('shell:starExe', path),
  starBySteam: (path) => ipcRenderer.invoke('shell:starBySteam', path),
  // core
  getModList: (game) => ipcRenderer.invoke('core:getModList', game),
  activeMod: (game, mod) => ipcRenderer.invoke('core:activeMod', game, mod),
  deActiveMod: (game, mod) => ipcRenderer.invoke('core:deActiveMod', game, mod)
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
  window.api = api
}
