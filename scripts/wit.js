const P = require('bluebird')
const GoogleSpreadsheet = P.promisifyAll(require('./spreadsheet'))
const CONFIDENCE_THRESHOLD = 0.75
const path = require('path')

let answers = null

const refreshAnswers = () =>
GoogleSpreadsheet
.getAnswersAsync()
.then(answers =>
  answers.reduce((acc, item) => {
    acc[item[0].trim()] = item[1]
    return acc
  }, {}
  )
)

/**
 * Main bot init
 */
module.exports = P.coroutine(function*(robot) {
  if (!process.env.HUBOT_WIT_TOKEN) {
    console.log('No wit token')
    return
  }
  // init gdrive "backend"
  yield GoogleSpreadsheet.initAsync(
    path.join(__dirname, '../client-secret.json')
  )
  answers = yield refreshAnswers()

  robot.respond(/(.*)/, P.coroutine(function* (msg) {
    const query = msg.match[1]
    try {
      const intent = yield getIntent(query, robot).catch(err => { msg.reply(err); throw err })
      const res = answers[intent]
      if (!res) { return msg.reply(`non so nulla dell'argomento ` + intent) }
      msg.reply(res)
    } catch (e) { console.log(e) }
  })
  )
})

const getIntent = (query, robot) => new Promise((resolve, reject) => {
  robot.http(`https://api.wit.ai/message?v=${process.env.HUBOT_WIT_VERSION}&session_id=123&q=${encodeURI(query)}`)
  .header('Content-Type', 'application/json')
  .header('Authorization', 'Bearer ' + process.env.HUBOT_WIT_TOKEN)
  .header('Accept', 'application/vnd.wit.20141022+json')
  .get()((err, r, body) => {
    if (err) reject(err)

    const res = JSON.parse(body)

    if (!res.entities.intent) {
      return reject('Ah boh non lo so')
    }

    const {confidence, value} = res.entities.intent[0]

    if (confidence < CONFIDENCE_THRESHOLD) {
      return reject(`Non sono sicuro di aver capito - ${JSON.stringify(res.entities.intent[0])}`)
    }

    return resolve(value)
  }) // this returned function is really annoying to promisify
})
