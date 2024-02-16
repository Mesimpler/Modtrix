import fse from 'fs-extra'
import fs from 'node:fs/promises'
import { join, relative } from 'node:path'

export async function concurrentWalk(dir, next, concurrencyLimit = 5) {
  const files = await fs.readdir(dir)

  for (let i = 0; i < files.length; i += concurrencyLimit) {
    const block = files.slice(i, i + concurrencyLimit)
    await Promise.all(
      block.map(async (file) => {
        const path = join(dir, file)
        const stats = await fs.stat(path)
        await next(file, stats, path)
      })
    )
  }
}

export async function getDirectorySize(dirPath) {
  let totalSize = 0

  const stats = await fs.stat(dirPath)
  if (!stats.isDirectory()) {
    return new Error('path must be a directory')
  } else {
    await concurrentWalk(dirPath, next)
  }

  async function next(file, stats, path) {
    if (stats.isFile()) {
      totalSize += stats.size
    }
    if (stats.isDirectory()) {
      await concurrentWalk(path, next)
    }
  }

  return totalSize
}

export async function getDirectoryFiles(dirPath, pathType = 'relative') {
  let files = []

  const stats = await fs.stat(dirPath)
  if (!stats.isDirectory()) {
    return new Error('dirPath must be a directory')
  } else {
    await concurrentWalk(dirPath, next)
  }

  async function next(file, stats, path) {
    if (stats.isFile()) {
      const relativePath = pathType === 'relative' ? relative(dirPath, path) : path
      files.push(relativePath)
    }
    if (stats.isDirectory()) {
      await concurrentWalk(path, next)
    }
  }

  return files
}

export async function getExistFiles(files) {
  const existFiles = await Promise.all(
    files.map(async (f) => {
      const exists = await fse.pathExists(f)
      return exists ? f : null
    })
  )
  return existFiles.filter((f) => f !== null)
}
