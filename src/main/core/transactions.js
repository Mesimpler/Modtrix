import _ from 'lodash'

export async function concurrentFileProcessing(
  files,
  processFile,
  rollbackFile,
  concurrencyLimit = 5
) {
  let completedResults = []

  for (let i = 0; i < files.length; i += concurrencyLimit) {
    const block = files.slice(i, i + concurrencyLimit)
    const stageCompletedResults = await Promise.all(
      block.map(async (f) => {
        try {
          await processFile(f)
          return {
            ...f,
            isSuccess: true
          }
        } catch (error) {
          return {
            ...f,
            isSuccess: false,
            error: error.toString()
          }
        }
      })
    )
    completedResults = completedResults.concat(stageCompletedResults)
  }

  const [successfulResults, failedResults] = _.partition(completedResults, (f) => f.isSuccess)

  if (failedResults.length > 0) {
    if (successfulResults.length > 0) {
      await Promise.all(
        successfulResults.map(async (result) => {
          await rollbackFile(result)
        })
      )
    }
    let err = new Error('File processing failed')
    err.failedResults = failedResults
    throw err
  }

  return successfulResults
}
