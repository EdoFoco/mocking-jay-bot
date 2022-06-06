const RealClient = require("discord.js").Client;
const { Intents } = require("discord.js");
const { Client } = require('discord.js-selfbot-v13');
const config = require("./config");
const mongoUtil = require("./database/mongoUtil.js");

const allIntents = new Intents(32767);

const selfbot = new Client({
  partials: ["MESSAGE", "REACTION", "GUILD_MEMBER", "CHANNEL", "USER"],
});
const realbot = new RealClient({
  partials: ["MESSAGE", "REACTION", "GUILD_MEMBER", "CHANNEL", "USER"],
  intents: allIntents,
});

let channels = [];

realbot.on("ready", async () => {
  console.log("Real bot is ready!");
});

selfbot.on("ready", async () => {
  await mongoUtil.connectDB(selfbot);
  const tempchannels = await selfbot.db.channels.find().toArray();
  channels = tempchannels.reduce(function (map, obj) {
    map[obj.id] = obj;
    return map;
  }, {});

  console.log("account bot is now ready!");
});

selfbot.on("message", async (message) => {
  const mappedChannel = channels[message.channel.id];
  if (mappedChannel) {
    mappedChannel.targets.forEach(async (t) => {
      const targetChannel = realbot.channels.cache.get(t.id);

      await targetChannel.send({
        content: `========================================================
  user: __**${message.author.tag}**__
  guild: __**${message.guild.name}**__
  channel: __**#${message.channel.name}**__
  
  \`\`\`${message.content}\`\`\``,
        embeds: message.embeds,
        files: [...message.attachments.map((i) => i.url)],
      });
    });
  }

  if (message.content.startsWith("!mj-add")) {
    const msgArr = message.content.split(" ");
    if (msgArr[1] === undefined) {
      return realbot.channels.cache
        .get(message.channel.id)
        .send("No channel selected");
    }

    const channelId = msgArr[1];
    if (!channels[channelId]) {
      await selfbot.db.channels.insertOne({
        id: channelId,
        targets: [{ id: message.channel.id }],
      });
      channels[channelId] = {
        id: channelId,
        targets: [{ id: message.channel.id }],
      };
    } else {
      const existing = channels[channelId].targets.filter(
        (t) => t.id === message.channel.id
      );
      if (existing.length > 0) {
        return await realbot.channels.cache
          .get(message.channel.id)
          .send("Channel was already added");
      }

      channels[channelId].targets.push({ id: message.channel.id });
      await selfbot.db.channels.findOneAndUpdate(
        { id: channelId },
        { $set: channels[channelId] },
        { new: true, upsert: true }
      );
    }
    await realbot.channels.cache.get(message.channel.id).send("Channel added");
  }

  if (message.content.startsWith("!mj-remove")) {
    const msgArr = message.content.split(" ");
    if (msgArr[1] === undefined) {
      return await realbot.channels.cache
        .get(message.channel.id)
        .send("No channel selected");
    }

    const channelId = msgArr[1];
    if (channels[channelId]) {
      const targets = channels[channelId].targets;
      var filtered = targets.filter((t) => t.id !== message.channel.id);
      if (filtered.length == 0) {
        await selfbot.db.channels.deleteOne({ id: channelId });
        delete channels[channelId];
      } else {
        channels[channelId].targets = filtered;
        await selfbot.db.channels.findOneAndUpdate(
          { id: channelId },
          { $set: channels[channelId] },
          { new: true, upsert: true }
        );
      }
      await realbot.channels.cache
        .get(message.channel.id)
        .send("Channel removed");
    }
  }

  if (message.content.startsWith("!mj-list")) {
    const channelList = await selfbot.db.channels.find().toArray();
    await realbot.channels.cache.get(message.channel.id).send({
      content:
        channelList
          .filter((channel) => realbot.channels.cache.get(channel.id))
          .map(
            (channel) =>
              `> __**${
                realbot.channels.cache.get(channel.id).guild.name
              }**__ | #${realbot.channels.cache.get(channel.id).name} | ${
                realbot.channels.cache.get(channel.id).id
              }`
          )
          .join("\n") || "None",
    });
  }

  if (
    message.content.startsWith("!mj-help") ||
    message.content.startsWith("!mocking-jay-help")
  ) {
    await realbot.channels.cache.get(message.channel.id).send({
      content: `> **mj-add {channelId}** - Starts relaying all messages from the source channel to this channel.
      > **mj-remove {channelId}** - Stops relaying messages from the source channel to this channel.
      > **mj-list** - Lists all channels that are currently being tracked.`,
    });
  }
});

selfbot.login(config.selfbotToken);
realbot.login(config.realbotToken);
