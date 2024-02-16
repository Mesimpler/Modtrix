import { shell } from 'electron'

export function showItemInFolder(event, filePath) {
  shell.showItemInFolder(filePath)
}
