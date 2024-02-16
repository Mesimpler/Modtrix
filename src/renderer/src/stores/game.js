import { defineStore, acceptHMRUpdate } from 'pinia'
import { useImmer } from '@renderer/use/useImmer'
import localforage from 'localforage'
import { computed, watch } from 'vue'
import _ from 'lodash'

export const useGameStore = defineStore('games', () => {
  const [games, updateGames] = useImmer([])

  const currentGame = computed(() => {
    const game = _.find(games.value, 'isCurrent')
    if (game) {
      return _.cloneDeep(game)
    } else {
      return undefined
    }
  })

  async function load(options = { autoSave: false }) {
    const localData = await localforage.getItem('games')
    if (localData) {
      updateGames(() => {
        return localData
      })
    }
    if (options.autoSave) {
      saveWatcher()
    }
  }

  function saveWatcher() {
    watch(
      games,
      async (newGames) => {
        await save(newGames)
      },
      { deep: true }
    )
  }

  async function save(data = games.value) {
    await localforage.setItem('games', _.cloneDeep(data))
  }

  function resetCurrentGame() {
    const targetIndex = _.findIndex(games.value, 'isCurrent')
    if (targetIndex !== -1) {
      updateGames((_games) => {
        _games[targetIndex].isCurrent = false
      })
    }
  }

  function setCurrentGame(game) {
    resetCurrentGame()
    const targetIndex = _.findIndex(games.value, { gameIno: game.gameIno })
    if (targetIndex !== -1) {
      updateGames((_games) => {
        _games[targetIndex].isCurrent = true
      })
    }
  }

  function addGame(game) {
    const targetIndex = _.findIndex(games.value, { gameIno: game.gameIno })
    if (targetIndex === -1) {
      resetCurrentGame()
      updateGames((_games) => {
        _games.push({ ...game, isCurrent: true })
      })
    } else {
      throw new Error('game has been exist.')
    }
  }

  function modifyGame(game) {
    const targetIndex = _.findIndex(games.value, { gameIno: game.gameIno })
    if (targetIndex !== -1) {
      updateGames((_games) => {
        _games[targetIndex] = game
      })
    }
  }

  function removeGame(game) {
    const targetIndex = _.findIndex(games.value, { gameIno: game.gameIno })
    if (targetIndex !== -1) {
      updateGames((_games) => {
        _.remove(_games, { gameIno: game.gameIno })
      })
    }
  }

  return {
    games,
    load,
    save,
    currentGame,
    setCurrentGame,
    addGame,
    modifyGame,
    removeGame
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useGameStore, import.meta.hot))
}
