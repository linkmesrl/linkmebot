const GoogleSpreadsheet = require('google-spreadsheet')
const P = require('bluebird')
const doc = P.promisifyAll(new GoogleSpreadsheet('1c6daQgMOkKuqj1D5ldrvPC6xQQm3qbRKHd_PCzR6tvA'))
const CONFIDENCE_THRESHOLD = 0.75
const path = require('path')

const init = P.coroutine(function*(robot) {
  if (!process.env.HUBOT_WIT_TOKEN) {
    console.log('No wit token')
    return
  }

  // init gdrive "backend"
  const auth = require(path.join(__dirname, '../faqbot-c4d68c18dfbb.json'))
  console.log(auth)
  yield doc.useServiceAccountAuthAsync(require(path.join(__dirname, '../faqbot-c4d68c18dfbb.json')))
  const info = yield doc.getInfoAsync()
  const sheet = P.promisifyAll(info.worksheets[0])

  robot.hear(/minchi|cazz|puttan|troia|figa|merd|suca/i, (res) => {
    res.send('vacci piano fratello')
  })

  robot.respond(/(.*)/, getFaq(robot, sheet))
})

const getFaq = (robot, sheet) => (msg) => {
  if (!process.env.HUBOT_WIT_TOKEN) {
    msg.reply('No wit token')
    return
  }

  const query = msg.match[1]

  robot.http(`https://api.wit.ai/message?v=${process.env.HUBOT_WIT_VERSION}&session_id=123&q=${encodeURI(query)}`)
  .header('Content-Type', 'application/json')
  .header('Authorization', 'Bearer ' + process.env.HUBOT_WIT_TOKEN)
  .header('Accept', 'application/vnd.wit.20141022+json')
  .get()(askSpreadsheet(sheet, msg)) // this returned function is really annoying to promisify
}

const askSpreadsheet = (sheet, msg) => P.coroutine(function*(err, r, body) {
  if (err) { msg.reply(err) }

  const res = JSON.parse(body)

  if (!res.entities.intent) {
    return msg.reply('Ah boh non lo so')
  }

  const {confidence, value} = res.entities.intent[0]

  if (confidence < CONFIDENCE_THRESHOLD) {
    return msg.reply(`Non sono sicuro di aver capito - ${JSON.stringify(res.entities.intent[0])}`)
  }

  const sheetResult = yield sheet.getCells()
  console.log(sheetResult)
})
module.exports = init
