
# Mocking Jay bot
## Introduction
Mocking Jay is a Discord bot that relays messages from one channel (source) to the other (target). Channel mappings are declared by the user using the mj commands.

## How it works
Mocking Jay connects to Discord using two accounts, one is used to listen to channel messages (self bot) and the other is used to publish the messages (real bot).

In order to work it needs to be added to the target Discord server and then configured using the mj commands.

## How to run it
- Create a bot in your Discord (https://discord.com/developers/applications)
- Add the bot token to the config.json (realBotToken)
- Get your personal discord token and userId (https://www.followchain.org/find-discord-token/)
- Add it to the config.json (selfBotToken)
- Configure a MongoDB and add the connection string and db name to config.json

Then run the usual npm commands:

> ```npm install```

> ```npm start```


## Configure
Once Mocking Jay has been added to the server...
- Open the source channel and get the id from the url. 
- Go to the target channel on your Discord server
- Type: ```!mj-add {channelId}```


## Other commands
> ```!mj-remove {channelId}```

> ```!mj-help```