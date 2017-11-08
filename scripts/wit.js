require('dotenv').config()
const google = require('../lib/google')
const faq = require('../lib/faq')

const CONFIDENCE_THRESHOLD = 0.75
const path = require('path')

/**
 * Main bot init
 */
module.exports = async function(robot) {
  if (!process.env.HUBOT_WIT_TOKEN) {
    console.log('No wit token')
    return
  }
  await google.init();

  robot.respond(/(.*)/, async function (msg) {
    const query = msg.match[1]

    try {
      const intent = await getIntent(query, robot)
      if(intent === null) {
        return msg.reply('Non ho capito')
      }

      const {intentName, entities} = intent
      if (intentName === 'richiesta ferie') {

        if(!entities.interval){
          return msg.reply('Non ho capito le date')
        }

        const to = new Date(entities.interval[0].to.value)
        const from = new Date(entities.interval[0].from.value)
        const title = 'Ferie ' + msg.message.user.name

        const r = await google.addEvent(title, from, to)
        return msg.reply('Ok fatto, ho segnato sul calendario la tua richiesta, sarai ricontatto/a')
      }

      const response = faq[intentName] || 'Non so nulla dell argomento ' + intentName;
      msg.reply(response)

    } catch (e) { 
      msg.reply(`è successo qualcosa di strano: ${e.message}`)
      console.log(e) 
    }
  })
}

const getIntent = (query, robot) => new Promise((resolve, reject) => {
  robot.http(`https://api.wit.ai/message?v=20171029&session_id=123&q=${encodeURI(query)}`)
  .header('Content-Type', 'application/json')
  .header('Authorization', 'Bearer ' + process.env.HUBOT_WIT_TOKEN)
  .header('Accept', 'application/vnd.wit.20141022+json')
  .get()((err, r, body) => {
    if (err) reject(err)

    const res = JSON.parse(body)

    if (!res.entities.intent) {
      return resolve(null);
    }

    const {confidence, value} = res.entities.intent[0]
    if (confidence < CONFIDENCE_THRESHOLD) {
      console.log(confidence, value);
      return resolve(null);
    }

    return resolve({intentName: value, entities: res.entities});
  }) 
})
