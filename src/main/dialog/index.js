import { BrowserWindow, dialog } from 'electron'
import { app } from 'electron'
import fs from 'node:fs/promises'
import _ from 'lodash'

export async function handleDirectoryOpen(event) {
  const fromWindow = BrowserWindow.fromWebContents(event.sender)
  const { canceled, filePaths } = await dialog.showOpenDialog(fromWindow, {
    properties: ['openDirectory', 'dontAddToRecent']
  })
  if (!canceled) {
    const path = filePaths[0]
    const stats = await fs.stat(path)
    return {
      path: path,
      stats: _.cloneDeep(stats)
    }
  }
}

export async function handleExeFileOpen(event) {
  const fromWindow = BrowserWindow.fromWebContents(event.sender)
  const { canceled, filePaths } = await dialog.showOpenDialog(fromWindow, {
    filters: [{ name: 'exe', extensions: ['exe'] }],
    properties: ['openFile', 'dontAddToRecent']
  })
  if (!canceled) {
    const path = filePaths[0]
    const stats = await fs.stat(path)
    const iconData = await app.getFileIcon(path, { size: 'normal' })
    return {
      path: path,
      stats: _.cloneDeep(stats),
      icon: iconData.toDataURL()
    }
  }
}
