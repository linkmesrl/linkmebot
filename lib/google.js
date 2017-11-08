let answers = null
const key = require('../botdemo.json')
const {promisifyAll} = require('bluebird')
const google = require('googleapis')
const calendar = google.calendar('v3')
const jwtClient = promisifyAll(new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ['https://www.googleapis.com/auth/calendar'], // an array of auth scopes
  null
))

const calendarClient = promisifyAll(calendar.calendars);
const aclClient = promisifyAll(calendar.acl);
const eventClient = promisifyAll(calendar.events);

module.exports.init = async function init() {
  await jwtClient.authorizeAsync()
  const primaryCal = await calendarClient.getAsync({
    auth: jwtClient,
    calendarId: 'primary'
  })
  const acl = (await aclClient.listAsync({
    auth: jwtClient,
    calendarId: primaryCal.id}
  )).items

  if(acl.length === 1){
    const res = await aclClient.insertAsync({
      auth: jwtClient,
      calendarId: primaryCal.id,
      resource: {
        role: 'owner',
        scope: {
          type: process.env.CALENDAR_OWNER_TYPE,
          value: process.env.CALENDAR_OWNER_ID
        }
      }
    })
  }
}

module.exports.addEvent = async function addEvent(name, from, to) {
  console.log(from, to)
  const res = await eventClient.insert({
    auth: jwtClient,
    calendarId: 'primary',
    resource: {
      summary: name,
      start: {
        'dateTime': from.toISOString(),
        'timeZone': 'Europe/Rome',
      },
      end: {
        'dateTime': to.toISOString(),
        'timeZone': 'Europe/Rome',
      },
    }
  })
  return res;
}

// module.exports.add

