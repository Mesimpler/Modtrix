import fse from 'fs-extra'
import _ from 'lodash'
import { concurrentWalk, getDirectorySize, getExistFiles, getDirectoryFiles } from './utils'
import { concurrentFileProcessing } from './transactions'
import { APP_CONFIGS } from '@shared/config'
import * as nodePath from 'node:path'
import { minimatch } from 'minimatch'

const dispatchFnMap = {
  DM_LINK: fse.ensureSymlink,
  DM_COPY: fse.copy
}

export async function getModList(event, game) {
  let data = []
  await concurrentWalk(game.modRepoSetting.repoRoot, async (file, stats, path) => {
    if (stats.isDirectory()) {
      const modObj = {
        modName: file,
        modRoot: path,
        modSize: await getDirectorySize(path),
        modIno: stats.ino.toString()
      }
      data.push(modObj)
    }
  })
  return _.sortBy(data, ['modName'])
}

export async function activeMod(event, game, mod) {
  const modConfig = await loadModConfig(game, mod)
  const files = await getDirectoryFiles(mod.modRoot)
  const dispatchFn = dispatchFnMap[modConfig.dispatchMode]
  let bakFiles = []

  // fliter
  const excludePatterns = modConfig.excludeFiles.split(' ').concat([APP_CONFIGS.MOD_PROFILE])
  const filteredFiles = _.filter(files, (f) => {
    return !excludePatterns.some((p) => {
      return minimatch(f, nodePath.normalize(p), {
        windowsPathsNoEscape: true,
        nocase: modConfig.ignoreCase
      })
    })
  })

  // format
  const handleFiles = filteredFiles.map((f) => {
    const destPath = nodePath.join(game.gameRoot, f)
    const bakPath = () => {
      const { dir, base } = nodePath.parse(destPath)
      const bakBaseName = base + APP_CONFIGS.MOD_BAKFILE
      return nodePath.format({ dir, base: bakBaseName })
    }
    return {
      name: nodePath.basename(destPath),
      destPath: destPath,
      srcPath: nodePath.join(mod.modRoot, f),
      relPath: f,
      bakPath: bakPath()
    }
  })

  const existFiles = await getExistFiles(handleFiles.map((f) => f.destPath))
  const existHandleFiles = _.filter(handleFiles, (f) => existFiles.includes(f.destPath))
  if (modConfig.activeMode === 'AM_ADD' && !_.isEmpty(existHandleFiles)) {
    return {
      code: 101,
      files: existHandleFiles.map((f) => {
        return {
          ...f,
          error: 'file has been exist.'
        }
      })
    }
  }
  if (modConfig.activeMode === 'AM_REPLACE' && !_.isEmpty(existHandleFiles)) {
    try {
      const successFiles = await createBakFiles(existHandleFiles)
      bakFiles = successFiles
    } catch (error) {
      return {
        code: 102,
        files: error.failedResults
      }
    }
  }

  try {
    const successFiles = await dispatchFiles(handleFiles, dispatchFn)
    return {
      code: 100,
      dispatchFiles: successFiles,
      bakFiles: bakFiles,
      modConfig: modConfig
    }
  } catch (error) {
    if (bakFiles.length > 0) {
      await recoverbakFiles(bakFiles)
    }
    return {
      code: 103,
      files: error.failedResults
    }
  }
}

export async function deActiveMod(event, game, mod) {
  const { dispatchFiles, modConfig, bakFiles } = mod
  const dispatchFn = dispatchFnMap[modConfig.dispatchMode]

  try {
    await callbackFiles(dispatchFiles, dispatchFn)
  } catch (error) {
    return {
      code: 104,
      files: error.failedResults
    }
  }

  if (!_.isEmpty(bakFiles)) {
    try {
      await recoverbakFiles(bakFiles)
    } catch (error) {
      await activeMod(null, game, mod)
      return {
        code: 105,
        files: error.failedResults
      }
    }
  }

  return {
    code: 100
  }
}

async function loadModConfig(game, mod) {
  let config = game.modRepoSetting

  if (mod.useWhichConfig === 'custom') {
    config = mod.modConfig
  }

  if (mod.useWhichConfig === 'profile') {
    try {
      const modProfile = await fse.readJson(nodePath.join(mod.modRoot, APP_CONFIGS.MOD_PROFILE))
      config = modProfile
    } catch (error) {
      config = game.modRepoSetting
    }
  }

  return config
}

async function createBakFiles(files) {
  return await concurrentFileProcessing(
    files,
    async (f) => {
      await fse.rename(f.destPath, f.bakPath)
    },
    async (f) => {
      await fse.rename(f.bakPath, f.destPath)
    }
  )
}

async function dispatchFiles(files, dispatchFn) {
  return await concurrentFileProcessing(
    files,
    async (f) => {
      await dispatchFn(f.srcPath, f.destPath)
    },
    async (f) => {
      await fse.remove(f.destPath)
    }
  )
}

async function recoverbakFiles(files) {
  return await concurrentFileProcessing(
    files,
    async (f) => {
      await fse.rename(f.bakPath, f.destPath)
    },
    async (f) => {
      await fse.rename(f.destPath, f.bakPath)
    }
  )
}

async function callbackFiles(files, dispatchFn) {
  return await concurrentFileProcessing(
    files,
    async (f) => {
      await fse.remove(f.destPath)
    },
    async (f) => {
      await dispatchFn(f.srcPath, f.destPath)
    }
  )
}
