
const P = require('bluebird')
const GoogleSpreadsheet = P.promisifyAll(require('./spreadsheet'))
const path = require('path')

/**
 * Main bot init
 */
const init = P.coroutine(function*(robot) {
  // init gdrive "backend"
  yield GoogleSpreadsheet.initAsync(
    path.join(__dirname, '../client-secret.json')
  )

  yield GoogleSpreadsheet.getAnswersAsync()
})

init().catch(() => { console.log('prrococo') })
