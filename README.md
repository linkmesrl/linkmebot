# DEMO BOT!
This rather unimpressive bot was built as a demo project. Will it evolve and actually be useful? Who knows! As now it responds with hardcoded answers to some itentes and creates events on google calendar.

## Prerequisites
Add .env file containing the following variables:

```
HUBOT_WIT_TOKEN=<valid wit.ai token>
CALENDAR_OWNER_TYPE=<google calendar owner type>
CALANDER_OWNER_ID=<google calender id>
HUBOT_SLACK_TOKEN=<a slack service token>
```

Please refer to google api and wit documentation in order to populate those variables.

## Scripts

`npm run dev` - starts the bot in dev mode aka with shell adapter

`npm start` - starts the bot with the slack adapter