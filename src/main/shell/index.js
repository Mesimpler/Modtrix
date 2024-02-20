import { shell } from 'electron'

export function showItemInFolder(event, filePath) {
  shell.showItemInFolder(path.join(filePath))
}

export function openPath(event, path) {
  shell.openPath(path)
}
