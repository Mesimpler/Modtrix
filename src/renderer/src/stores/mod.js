import { defineStore, acceptHMRUpdate, storeToRefs } from 'pinia'
import { useImmer } from '@renderer/use/useImmer'
import localforage from 'localforage'
import { computed, ref, watch } from 'vue'
import _ from 'lodash'

import { useGameStore } from '@renderer/stores/game'

export const useModStore = defineStore('mods', () => {
  const [mods, updateMods] = useImmer({})
  const [caches, updateCaches] = useImmer([])
  const dataLoading = ref(false)

  const gameStore = useGameStore()
  const { currentGame } = storeToRefs(gameStore)

  async function load(options = { autoSave: false, autoLoad: true }) {
    const localData = await localforage.getItem('mods')
    if (localData) {
      updateMods(() => {
        return localData
      })
    }
    if (options.autoSave) {
      saveWatcher()
    }
    if (options.autoLoad) {
      loadCurrentGameModsWatcher()
    }
  }

  function loadCurrentGameModsWatcher() {
    watch(
      () => gameStore.currentGame,
      async (newGame) => {
        if (newGame) {
          await loadGameMods(newGame)
        }
      }
    )
  }

  function saveWatcher() {
    watch(
      mods,
      async (newMods) => {
        await save(newMods)
      },
      { deep: true }
    )
  }

  async function save(data = mods.value) {
    await localforage.setItem('mods', _.cloneDeep(data))
  }

  const currentGameMods = computed(() => {
    if (currentGame.value) {
      return mods.value[currentGame.value.gameIno]
    } else {
      return []
    }
  })

  async function loadGameMods(game = currentGame.value, options = { force: false }) {
    const hasCached = _.includes(caches.value, game.gameIno)
    if (!hasCached || options.force) {
      dataLoading.value = true
      await syncGameMods(game)
      await new Promise((resolve) => setTimeout(resolve, 300))
      dataLoading.value = false
    }
  }

  async function syncGameMods(game) {
    let alignData = []
    const fileMods = await window.api.getModList(game)
    const storageMods = mods.value[game.gameIno]

    if (!_.isEmpty(storageMods)) {
      const addedMods = _.differenceBy(fileMods, storageMods, 'modIno')
      const removedMods = _.differenceBy(storageMods, fileMods, 'modIno')

      alignData = _.filter(storageMods, (sm) => {
        const isActived = sm.modStatus || false
        const isRemoved = _.findIndex(removedMods, { modIno: sm.modIno }) !== -1

        return isActived || !isRemoved
      })

      alignData = alignData.map((sm) => {
        const fm = _.find(fileMods, { modIno: sm.modIno })
        if (fm) {
          return {
            ...sm,
            modName: fm.modName,
            modSize: fm.modSize
          }
        } else {
          return sm
        }
      })
      alignData = alignData.concat(addedMods)
    } else {
      alignData = fileMods
    }

    updateMods((_mods) => {
      _mods[game.gameIno] = alignData
    })
    updateCaches((_caches) => {
      _caches.push(game.gameIno)
    })
  }

  function modifyMod(game = currentGame.value, mod, newMod) {
    const gameMods = mods.value[game.gameIno]
    if (gameMods) {
      const targetIndex = _.findIndex(gameMods, { modIno: mod.modIno })
      if (targetIndex !== -1) {
        updateMods((_mods) => {
          _mods[game.gameIno][targetIndex] = newMod
        })
      } else {
        throw new Error('mod not exist!')
      }
    } else {
      throw new Error('game not exist!')
    }
  }

  async function activeMod(game, mod) {
    const result = await window.api.activeMod(game, _.cloneDeep(mod))
    if (result.code === 100) {
      modifyMod(game, mod, {
        ...mod,
        modStatus: true,
        dispatchFiles: result.dispatchFiles,
        bakFiles: result.bakFiles,
        modConfig: result.modConfig
      })
    }

    return result
  }

  async function deActiveMod(game, mod) {
    const safeMod = _.cloneDeep(mod)
    const result = await window.api.deActiveMod(game, safeMod)
    if (result.code === 100) {
      delete safeMod.dispatchFiles
      delete safeMod.bakFiles
      delete safeMod.modConfig

      modifyMod(game, mod, {
        ...safeMod,
        modStatus: false
      })
    }
    return result
  }

  return {
    mods,
    load,
    save,
    dataLoading,
    currentGameMods,
    loadGameMods,
    modifyMod,
    caches,
    activeMod,
    deActiveMod
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useModStore, import.meta.hot))
}
