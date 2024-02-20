const { exec } = require('child_process')

export function starExe(event, exe) {
  exec(`"${exe}"`, (error) => {
    if (error) {
      return error
    }
  })
}

export function starBySteam(event, gameStaemId) {
  exec(`start steam://rungameid/${gameStaemId}`, (error) => {
    if (error) {
      return error
    }
  })
}
