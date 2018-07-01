// Load up the discord.js library. Else throw an error.
try {
  var Discord = require('discord.js')
  if (process.version.slice(1).split('.')[0] < 8) {
    throw new Error('Node 8.0.0 or higher is required. Please upgrade / update Node.js on your computer / server.')
  }
} catch (e) {
  console.error(e.stack)
  console.error('Current Node.js version: ' + process.version)
  console.error("In case you've not installed any required module: \nPlease run 'npm install' and ensure it passes with no errors!")
  process.exit()
}

// Defining many different things.

// Discord client
const client = new Discord.Client()

// Modules
const yt = require('ytdl-core')
const chrono = require('chrono-node')
const Moment = require('moment')
const _ = require('lodash')
const Promise = require('bluebird')
const fs = require('fs')
const talkedRecently = new Set()
const dialogflow = require('apiai')
const got = require('got')
const Jimp = require('jimp')

// Module for translating binary / text into text / binary
const textanary = require('textanary')

// const PNG  = require('pngjs').PNG
// const opus = require('opusscript')

// Local modules
// Functions for events of the client
//const eventCall = require('./modules/eventCalls')
// All functions which has something to do with requesting data from somewhere
const dataRequest = require('./modules/datarequest')
// Functions needed for other stuff like returning a Date string or maths
const Util = require('./modules/util')
// All functions needed for some commands
const noname = require('./modules/no-name')


// Production files / functions
const config = require('./config.json')
const bans = require('./bans.json')
const dialogflowApp = dialogflow(config.dialogAPI)

// Hooks
//const hook = new Discord.

//Client(config.hook_id, config.hook_token)
const vent = new Discord.WebhookClient(config.vent_id, config.vent_token)
const ventrevealer = new Discord.WebhookClient(config.vent_reveal_id, config.vent_reveal_token)

// Queue for music
const queue = {}

// APIs
const dscrdbotsAPI_token = config.dscrdbotsAPI_token;

// Random games
const games = ['Pineapple should not go on pizza.','Use +help to get help.','+help me.','Robots are forever on life support.','I no longer find Cards Against Humanity funny.','Vine was never funny.','I committed tax fraud for respect to yoshi.', 'Waluigi is the best.', 'biagios.github.io/porn', 'gradientforest.com', 'iconic.']
setInterval(function () {
  const rangame = games[Math.floor(Math.random() * games.length)]
  client.user.setActivity(rangame)
}, 60000 * 5)

// Console output messages when something went wrong
client.on('warn', console.warn)

// Console output messages when something went wrong
client.on('error', console.error)

// The events under here will run if the bot starts, and logs in, successfully.
client.on('ready', () => {
  console.log('-------------')
  console.log('Logged in!')
  console.log('-------------')
  console.log('Starting Pal...\nNode version: ' + process.version + '\nDiscord.js version: ' + Discord.version)
  console.log('-------------')
  console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`)
  console.log('-------------')
  console.log('Trying to log in with token...')
  console.log('-------------')
})

// This will run only if the bot has disconnected, for whatever reason.
client.on('disconnected', function () {
  console.error('Disconnected!')
})

client.on('reconnecting', () => console.log('I am reconnecting now!'))

// This event triggers only when the bot joins a guild.
client.on('guildCreate', guild => {
  console.log(`New server joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)
})

// This event triggers only when the bot is removed from a guild.
client.on('guildDelete', guild => {
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`)
})

// This event will run on every single message received, from any channel or DM.
client.on('message', async message => {

  // Ignore other bots. This also makes your bot ignore itself and not get into a "botception".
  // We're preventing DM command spams with this too.
  if (message.author.bot) return

  // if (bans.bans.includes(message.author.id)) {message.reply('You are banned using commands.')};
  // Here we separate our "command" name, and our "arguments" for the command.
  // e.g. if we have the message "+say Is this the real life?" , we'll get the following:
  // command = say
  // args = ["Is", "this", "the", "real", "life?"]
  let args = message.content.slice(config.prefix.length).trim().split(/ +/g)

  // Make recived command all lower case.
  const command = args.shift().toLowerCase()

  // Content of the message in lower cases.
  // Attention: not usable for, for example, replacing message.content in splittedContentArgs
  // because there could be arguments which should not be in lower cases.
  let content = message.content.toLowerCase()

  // Message used for DialogFlow, this removes the bots id to make the bot work better.
  const messageDialogFlow = message.content.replace('<@300955174225051650> ', '')

  // This is actually the same like the splitting of the command content into arguments.
  // This here is more optimized for usages without using the command prefix like in DM conservations
  // --> ToDO: Find a better name for these variables. They sound too bad. :/
  let splittedContentArgs = message.content.trim().split(/ +/g)
  let splittedContentCommand = splittedContentArgs.shift().toLowerCase()

  if (talkedRecently.has(message.author.id)) {
    // message.reply(":warning: You used the command `" + command +"` too many times. Wait `2.5` seconds to send the command again.");
    return
  }

  // Adds the user to the set so that they can't talk for 2.5 seconds
  talkedRecently.add(message.author.id)
  setTimeout(() => {
    // message.reply(":warning: You used the command `" + command +"` too many times. Wait `2.5` seconds to send the command again.")
    // Removes the user from the set after 2.5 seconds
    talkedRecently.delete(message.author.id)
  }, 2500)

  if (message.isMentioned(client.user)) {
    let request = dialogflowApp.textRequest(messageDialogFlow, {
      sessionId: '<unique session id>'
    })

    request.on('response', function (response) {
      message.channel.send(response.result.fulfillment.speech)
    })
    request.on('error', function (error) {
      console.log(error)
    })
    request.end()
  }

  if (message.channel.type === 'dm') {
    console.log('Discord -> Bot -> Direct Message: DM by ' + message.author.tag + ' (' + message.author.id + ' | Content: ' + message.content + ')')

    if (content === 'hello') {
      message.react('👋')
      message.channel.send('Yo, what´s up!' +
        '\nLater, I´ll be able to answer questions and to do some good things which I don´t know what it will be but I know it will be good (I hope).' +
        '\nBut you can check out the repository here and maybe contribute to it to help us developing and evolving myself: https://github.com/biagios/pal')
      message.channel.send({
        embed: {
          title: 'Repository on GitHub:',
          color: 3447003,
          description: `Bot on version ${config.version}`,
          fields: [
            {
              name: 'Link:',
              value: 'https://github.com/biagios/pal'
            }
          ]
        }
      })
      message.channel.send(
        'On my discord server, you can get some news about the development state of this bot and where we need help: https://discord.gg/fz7q53e' +
        '\nOr just write an issue in the repository which I already sent to you!')
    }
    if (content === 'help') {
      message.react('👌')
      message.channel.send('Ok, here you go:')
      message.channel.send({
        embed: {
          title: 'Bot commands you can use in a direct message conservation:',
          color: 3447003,
          description: '(You dont need to use any prefix or other special character before the command!)',
          fields: [
            {
              name: 'version',
              value: 'Sends you just the version of this bot'
            },
            {
              name: "'Coming Soon'",
              value: 'Sends you a list of features which will come very soon!'
            }
          ]
        }
      })
    }
    if (content === 'version') {
      message.react('🆗')
      message.channel.send(`I am currently in version ${config.version}. You can check the changelog of this version here: https://github.com/biagios/pal/releases/tag/${config.version}`)
    }

    if (content === 'coming soon') {
      message.react('💬')
      message.channel.send('Here is a list of features and enhancements I´ll get in the near future:')
      message.channel.send({
        embed: {
          title: 'List of features and enhancements in the near future',
          color: 3447003,
          fields: [
            {
              name: '- Adding more direct message commands',
              value: 'I´ll be able to make a better conservation with you with more DM commands'
            },
            {
              name: '- Enhance already existing direct message commands',
              value: 'The DM commands I already have will be enhanced with more special stuff'
            },
            {
              name: '- Enhance direct message communication with the bot with AI',
              value: 'With an AI-powered communication system, I´ll be able to give you more intelligent answers (maybe)'
            },
            {
              name: '- Adding more and enhance discord server related commands',
              value: 'There are some commands planned for the bot which you can use on your discord server. ' +
              'Currently there is nothing which we have fully planned but to know what we´re going to add, you should use this DM command often beacuse we´re going to refresh this list regularly. ' +
              'If you have some features in mind we should add or anything we can enhance, just write an issue to our repository. Just write the ' + config.prefix + 'github ``issue`` command in a discord ' +
              'server or just write "hello" to this bot to get a link to the repository. Pull requests to the repository are appreciated! :) '
            }
          ]
        }
      })
    }

      /*
      Vent command for DM conservations & optimized for DM conservations (able to use with or without prefix)
      (so you are able to use vent in a DM conservation where nobody can read it and to be able to send fully anonymously)
      Description: Sends an anonymous message to a webhook in a log server.
      */

    if (command === 'vent' || splittedContentCommand === 'vent') {
      if (bans.vbans.includes(message.author.id)) {
        message.reply('You are banned using this command.')
        return
      }
      if (!args[0]) {
        message.channel.send('Please provide text to send.')
        return
      }
      // makes the bot say something and delete the message. As an example, it's open to anyone to use.
      // To get the "message" itself we join the `args` back into a string with spaces:

      // Explanation why we use args and not splittedContentArgs
      // The reason is: you would only allow content which are not containing a prefix.
      // It should be allowed that you can write a command with and without the prefix.
      // command and splittedContentCommand are the same but in command, the first character (the prefix) will be cut out
      // so instead of !vent you have only vent. When you now sending this command without a prefix, you get "ent" but not the command you want to check.
      // splittedContentCommand does not slice the first character out. But splittedContentArgs works like args, just without the slicing (.slice()).
      // TL;DR: Just let it like it should be. :D

      const rant = args.join(' ')

      // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
      message.delete().catch(O_o => {}) // eslint-disable-line camelcase

      // And we get the bot to say the thing:
      vent.send(rant + ' - Anonymous')
      ventrevealer.send('Discord -> Bot -> Direct Message by ' + message.author.tag + ' ( Author ID' + message.author.id + ' | Content: ' + message.content + ')')
      message.channel.send('Message sent to #vent successfully.')
      if (rant.includes('suicide') || rant.includes('kill myself') || rant.includes('suicidal') || rant.includes('going to killmyself') || rant.includes('kms')){
        message.author.send('Pal has detected your message has to do with suicide. If you are struggling please remember you are not alone and many have gone throught the same as you. Please, if you are thinking about it refer to one of these numbers: https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines')
      }
    }
  }

  // Ignore other bots. This also makes your bot ignore itself and not get into a "botception".
  // And ignoring commands sent via dm to the bot
  if (message.author.bot || message.channel.type === 'dm') return

  // Ignore any message that does not start with our prefix, set in the configuration file.
  if (message.content.indexOf(config.prefix) !== 0) return

  // Logging every sent command.
  console.log('Recived ' + message.content + ' from ' + message.author + '. Treating it as a command.')
  // hook.send("Recived " + message.content + ". Treating it as a command.");
  console.log('-------------')

  if (command === 'clear') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    // const mod = message.member
    if (message.member.hasPermission('MANAGE_MESSAGES')) {
      const user = message.mentions.users.first()
      const amount = parseInt(message.content.split(' ')[1]) ? parseInt(message.content.split(' ')[1]) : parseInt(message.content.split(' ')[2])
      if (!amount) return message.reply(':warning: Must specify an amount to delete!')
      if (amount === 1) return message.reply(':warning: Please delete more than one message.')
      if (!amount && !user) return message.reply(':warning: Must specify a user and amount, or just an amount, of messages to purge!')
      message.channel.fetchMessages({
        limit: amount
      }).then((messages) => {
        if (user) {
          const filterBy = user ? user.id : client.user.id
          messages = messages.filter(m => m.author.id === filterBy).array().slice(0, amount)
        }
        message.channel.bulkDelete(messages).catch(error => message.channel.send(':warning: Oh no error: ' + error))
      })
    } else {
      message.reply(':warning: You must be able to delete messages to use this command!')
    }
  }


  /*
  Command: devs
  Description: Sends you who the main developers of this bot are.
  */
  if (command === 'dev' || command === 'devs' || command === 'developer') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    message.delete().catch((e) => {
      Util.betterError(message, `dev Command -> message.delete() -> catch e: ${e}`)
    })
    message.author.send('The main developers are: **Biagio#8115**, **yaman#8901** and **Bean#4675**.')
  }

  if (command === 'rps') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    const paction = args.join(' ')
    const bactions = ['rock', 'scissors', 'paper']
    const ranbaction = bactions[Math.floor(Math.random() * bactions.length)]
    if (!args[0]) {
      message.channel.send('Please provide an action, this can be `rock` `paper` or `scissors`.')
      return
    } else if (paction === ranbaction) {
      message.channel.send('I choose `' + ranbaction + '`!')
      message.reply(":necktie: It's a tie!")
    } else if (ranbaction === 'rock' && paction === 'paper') {
      // User wins.
      message.channel.send('I choose `' + ranbaction + '`!')
      message.reply('You win!')
    } else if (ranbaction === 'scissors' && paction === 'rock') {
      message.channel.send('I choose `' + ranbaction + '`!')
      message.reply('You win!')
    } else if (ranbaction === 'paper' && paction === 'scissors') {
      message.channel.send('I choose `' + ranbaction + '`!')
      message.reply('You win!')
    } else if (ranbaction === 'rock' && paction === 'scissors') {
      // User looses
      message.channel.send('I choose `' + ranbaction + '`!')
      message.reply('You lose!')
    } else if (ranbaction === 'scissors' && paction === 'paper') {
      message.channel.send('I choose `' + ranbaction + '`!')
      message.reply('You lose!')
    } else if (ranbaction === 'paper' && paction === 'rock') {
      message.channel.send('I choose `' + ranbaction + '`!')
      message.reply('You lose!')
    } else {
      message.reply('Please use `rock` `paper` or `scissors`.')
      return
    }
  }

  if (command === 'play') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    const voiceChannel = message.member.voiceChannel
    voiceChannel.join().catch((e) => {
      Util.betterError(message, `play Command -> voiceChannel.join() -> catch e: ${e}`)
    })
    if (queue[message.guild.id] === undefined) return message.channel.send(`Add some songs to the queue first with ${config.prefix}add`)
    if (queue[message.guild.id].playing) return message.channel.send('Already Playing')
    let dispatcher
    queue[message.guild.id].playing = true
    console.log(queue);
    (function play (song) {
      console.log(song)
      if (song === undefined) {
        return message.channel.send('Queue is empty').then(() => {
          queue[message.guild.id].playing = false
          message.member.voiceChannel.leave()
        })
      }
      message.channel.send(`Playing: **${song.title}** as requested by: **${song.requester}**`)
      dispatcher = message.guild.voiceConnection.playStream(yt(song.url, { audioonly: true }), { passes: config.passes })
      let collector = message.channel.createCollector(m => m)
      // Message won't work soon use collect it said
      collector.on('collect', () => {
        if (message.content.startsWith(config.prefix + 'pause')) {
          message.channel.send(':white_check_mark: Song paused.').then(() => { dispatcher.pause() })
        }
        if (message.content.startsWith(config.prefix + 'resume')) {
          message.channel.send(':white_check_mark: Song resumed.').then(() => { dispatcher.resume() })
        }
        if (message.content.startsWith(config.prefix + 'skip')) {
          message.channel.send(':white_check_mark: Song skipped.').then(() => { dispatcher.end() })
        }
        if (message.content.startsWith(config.prefix + 'time')) {
          message.channel.send(`Time in song: ${Math.floor(dispatcher.time / 60000)}:${Math.floor((dispatcher.time % 60000) / 1000) < 10 ? '0' + Math.floor((dispatcher.time % 60000) / 1000) : Math.floor((dispatcher.time % 60000) / 1000)}.`)
        }
      })
      dispatcher.on('end', () => {
        collector.stop()
        play(queue[message.guild.id].songs.shift())
      })
      dispatcher.on('error', (err) => {
        return message.channel.send(':warning: Oh no error: ' + err).then(() => {
          collector.stop()
          play(queue[message.guild.id].songs.shift())
        })
      })
    })(queue[message.guild.id].songs.shift())
  }

  if (command === 'join') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    const voiceChannel = message.member.voiceChannel
    if (!voiceChannel) {
      return message.reply(':x: You must be in a voice channel first!')
    }
    voiceChannel.join().catch((e) => {
      Util.betterError(message, `join Command -> voiceChannel.join() -> catch e: ${e}`)
    })
    message.channel.send(':white_check_mark: I joined the channel successfully!')
  }

  if (command === 'leave') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    const voiceChannel = message.member.voiceChannel
    if (!voiceChannel) {
      return message.reply(':x: You must be in a voice channel first!')
    }
    voiceChannel.leave()
    message.channel.send(':white_check_mark: I left the voice channel!')
  }

  if (command === 'add') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    let url = message.content.split(' ')[1]
    if (url === '' || url === undefined) return message.channel.send(`:x: You must add a YouTube video url, or id after ${config.prefix}add`)
    yt.getInfo(url, (err, info) => {
      console.log(err + info)
      if (err) return message.channel.send(':x: Invalid YouTube Link: ' + err)
      if (!queue.hasOwnProperty(message.guild.id)) queue[message.guild.id] = {}, queue[message.guild.id].playing = false, queue[message.guild.id].songs = [] // eslint-disable-line
      queue[message.guild.id].songs.push({url: url, title: info.title, requester: message.author.username})
      message.channel.send(`:musical_note: Added **${info.title}** to the queue`)
    })
  }

  /*
  Command: bot-info
  Description: Provides info about the bot.
  */
  if (command === 'bot-info') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
     const upmin = (client.uptime / 60000);
    const uphour = (client.uptime / 60000) / 60;
    message.channel.send({
      embed: {
        title: 'Bot-Info',
        description: 'Stats of the bot, just for nerds.',
        color: 16777215,
        footer: {
          text: '© Midday Clouds'
        },
        author: {
          name: client.user.username,
          icon_url: client.user.avatarURL
        },
        fields: [
          {
            name: 'Servers online in:',
            value: client.guilds.size,
            inline: true
          },
          {
            name: 'Users serving',
            value: client.users.size,
            inline: true
          },
          {
            name: 'Uptime (super borked)',
            value: `${uphour}h ${upmin}min << these are broken sorry!`
          },
        ]
      }
    })
  }

  /*
  Command: invert
  Description: Inverts user's pfp.
  */

  if (command === 'invert') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    let url = message.author.avatarURL
    Jimp.read(url).then(function (image) {
      image.resize(1024, 1024, Jimp.RESIZE_BEZIER)
      image.invert()
      let outputfile = './img/output/' + Math.random().toString(36).substr(2, 5) + 'sad.' + image.getExtension() // create a random name for the output file
      image.write(outputfile, function () {
        // upload file
        message.channel.send({
          'files': [outputfile]
        }).then(function () {
        // delete file
          fs.unlink(outputfile)
          message.channel.stopTyping()
        })
      })
    }).catch((e) => {
      Util.betterError(message, `invert Command -> Jimp.read -> catch e: ${e}`)
    })
  }

  function doRandomSizeBlack () {
    let rand = [Jimp.FONT_SANS_64_BLACK]
    return rand[Math.floor(Math.random() * rand.length)]
  }

  function doRandomSizeWhite () {
    let rand = [Jimp.FONT_SANS_64_WHITE]
    return rand[Math.floor(Math.random() * rand.length)]
  }

  /*
  Command: sad-black
  Description: Adds custom black text to image and turns it gray
  */

  if (command === 'sad-black') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.channel.send('Please provide text')
      return
    }
    message.channel.startTyping()
    let url = message.author.avatarURL
    Jimp.read(url).then(function (image) {
      Jimp.loadFont(doRandomSizeBlack()).then(function (font) { // load font from .fnt file
      // print a message on an image
      // image.print(font, 2, 2, args.join(" "), Jimp.ALIGN_FONT_CENTER); // print a message on an image with text wrapped at width
        image.resize(1024, 1024, Jimp.RESIZE_BEZIER)
          .greyscale()
          .print(font, 20, 960, args.join(' '), Jimp.ALIGN_FONT_CENTER).getBuffer(Jimp.MIME_JPEG, Util.onBuffer)
        let outputfile = './output/' + Math.random().toString(36).substr(2, 5) + 'sad.' + image.getExtension() // create a random name for the output file
        image.write(outputfile, function () {
          // upload file
          message.channel.send({
            'files': [outputfile]
          }).then(function () {
          // delete file
            fs.unlink(outputfile)
            message.channel.stopTyping()
          })
        })
      })
    }).catch((e) => {
      Util.betterError(message, `sad-black Command -> Jimp.read -> catch e: ${e}`)
    })
  }

  if (command === 'inspire') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    // let errimage = 'http://inspirobot.me/website/images/inspirobot-dark-green.png'
    got('http://inspirobot.me/api?generate=true').then((res) => {
      // console.log('error:', error); // Print the error if one occurred
      // console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received
      message.channel.send(
        {
          files: [
            res.body
          ]
        })
    })
  }

/*
Command: sad-white
Description: Adds custom white text to image and turns it gray
*/

  if (command === 'sad-white') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.channel.send('Please provide text')
      return
    }
    message.channel.startTyping()
    let url = message.author.avatarURL
    Jimp.read(url).then(function (image) {
      Jimp.loadFont(doRandomSizeWhite()).then(function (font) { // load font from .fnt file
        // print a message on an image
        // image.print(font, 2, 2, args.join(" "), Jimp.ALIGN_FONT_CENTER); // print a message on an image with text wrapped at width
        image.resize(1024, 1024, Jimp.RESIZE_BEZIER)
          .greyscale()
          .print(font, 20, 960, args.join(' '), Jimp.ALIGN_FONT_CENTER).getBuffer(Jimp.MIME_JPEG, Util.onBuffer)
        let outputfile = './output/' + Math.random().toString(36).substr(2, 5) + 'sad.' + image.getExtension() // create a random name for the output file
        image.write(outputfile, function () {
        // upload file
          message.channel.send({
            'files': [outputfile]
          }).then(function () {
          // delete file
            fs.unlink(outputfile)
            console.log('SUCCESS: ' + message.author.username)
            message.channel.stopTyping()
          })
        })
      })
    }).catch((e) => {
      Util.betterError(message, `sad-white Command -> Jimp.read -> catch e: ${e}`)
    })
  }
  /*
  Command: remind
  Description: Remind you about upcoming things, lol.
  */
  if (command === 'remind') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) { message.channel.send('Incorrect format. +remind <minutes> <message>'); return }
    const msg = args.join(' ')
    return new Promise((resolve) => {
      if (!isNaN(args[0])) {
        const time = _.parseInt(args[0])
        if (time > 10080 || isNaN(time)) message.channel.send('Maximum time is 7 days (10080 minutes)')
        if (time < 1) message.channel.send('Time must be at least 1 minute.')
        setTimeout(() => {
          message.author.send(`:fire: REMEMBER: ${msg.split(' ').slice(1).join(' ')}! :fire:`)
        }, time * 60000)
        const minuteMsg = time === 1 ? 'minute' : 'minutes'
        message.channel.send(`Reminding you in ${time} ${minuteMsg}.`)
      }
      const results = chrono.parse(msg)
      if (results.length === 0) return resolve('Error parsing date. Try using format: +remind <minutes> <message>')
      let endTime = Moment(results[0].start.date())
      const currentTime = new Moment()
      let duration = Moment.duration(endTime.diff(currentTime))
      let minutes = Math.round(duration.asMinutes())
      if (minutes < 1) {
        if (results[0].end) {
          endTime = results[0].end.date()
          duration = Moment.duration(endTime.diff(currentTime))
          minutes = duration.asMinutes()
        }
        if (minutes < 1) {
          message.channel.send('Time must be at least 1 minute.')
        }
      }
      if (minutes > 10080) return resolve('Maximum time is 7 days (10080 minutes)')
      setTimeout(() => {
        message.author.send(`:fire: REMEMBER: "${msg}"! :fire:`)
      }, minutes * 60000)
      const minuteMsg = minutes === 1 ? 'minute' : 'minutes'
      message.channel.send(`Reminding you in ${minutes} ${minuteMsg}.`)
    })
  }

  /*
  Command: ping
  Description: Helps check if bot is alive, returns ping of bot.
  */
  if (command === 'ping') {
    const pings = ['the moon.', 'europe.', 'oceania.', 'Trump.', 'a baguette.', 'pizza.', 'the Netherlands.', 'September 11th, 2001.', 'Google.', 'the BBC.', 'my mother.', 'Mr. Meeseeks.', "pewdipie's firewatch stream.", 'uncensored hentai.', 'Julian Assange.','Vine.']
    const ranQuote = pings[Math.floor(Math.random() * pings.length)]
    // Calculates ping between sending a message and editing it, giving a nice round-trip latency.
    // The second ping is an average latency between the bot and the websocket server (one-way, not round-trip).
    const m = await message.channel.send('One second...')
    m.edit('It took ` ' + (m.createdTimestamp - message.createdTimestamp) + ' ms ` to :ping_pong: ' + ranQuote + '\nAlso, the API latency is `' + Math.round(client.ping) + ' ms`')
  }

  /*
  Command: vent
  Description: Sends an anonymous message to a webhook in a log server.
  */
  if (command === 'vent') {
    if (bans.vbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.channel.send(':warning: **Please provide text to send.**')
      return
    }
    // makes the bot say something and delete the message. As an example, it's open to anyone to use.
    // To get the "message" itself we join the `args` back into a string with spaces:
    const rant = args.join(' ')
    // Then we delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    await message.delete().catch(O_o => {}) // eslint-disable-line camelcase
    // And we get the bot to say the thing:
    vent.send(rant + ' - Anonymous')
    ventrevealer.send('Discord -> Bot -> Message by ' + message.author.tag + ' ( Author ID:' + message.author.id + ' | Content: ' + message.content + ')')
    message.author.send('Message sent to #vent successfully.')
    if (rant.includes('suicide')){
      message.author.send('Pal has detected your message has to do with suicide. If you are struggling please remember you are not alone and many have gone throught the same as you. Please, if you are thinking about it refer to one of these numbers: https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines')
    }
  }

  /*
  Command: update
  Description: Should update the bot from the github repo.
  */
  if (command === 'update') {
    if (config.updateIDs.includes(message.author.id)) {
			message.channel.send('Fetching updates...').then(function (sentMsg) {
        console.log('Bot updating...')
        let spawn = require('child_process').spawn
        /* eslint-disable */
        // Unused variable
        /* let log = function (err, stdout, stderr) {
          if (stdout) { console.log(stdout) }
          if (stderr) { console.log(stderr) }
        } */
        /* eslint-enable */

        let fetch = spawn('git', ['fetch'])
        fetch.stdout.on('data', function (data) {
          console.log(data.toString())
          console.log('Fetch Defined')
        })

        fetch.on('close', function (code) {
          let reset = spawn('git', ['reset', '--hard', 'origin/master'])
          reset.stdout.on('data', function (data) {
            console.log(data.toString())
            console.log('Fetch Close Executed')
          })

          reset.on('close', function (code) {
            let npm = spawn('npm', ['install'])
            npm.stdout.on('data', function (data) {
              console.log(data.toString())
              console.log('reset.on Executed')
            })

            npm.on('close', function (code) {
              console.log('Bot restarting...')
              sentMsg.edit('Restarting...').then(function () {
                client.destroy().then(function () {
                  process.exit()
                })
              })
            })
          })
        })
      })
    } else {
      	message.react('👎').catch((e) => {
          Util.betterError(message, `update Command -> ELSE config.updateIDs.includes(message.author.id) -> catch e: ${e}`)
        })
    }
  }
  /*
  Command: clap
  Description: Replaces spaces in your text with clapping emojis.
  */
  if (command === 'clap') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.channel.send('Please :clap: provide :clap: some :clap: text :clap: to :clap: clapify')
    }
    const str = args.join(' ')
    const clapstr = str.split(' ').join(' :clap: ')
    message.channel.send(clapstr)
  }


  /*
  Command: weather
  Description: Gives weather information for a city.
  */
  if (command === 'weather') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }

    if (!args[0]) {
      message.react('👎').catch((e) => {
        Util.betterError(message, `weather -> !args[0] -> message.react -> catch e: ${e}`)
      })
      message.channel.send('Please provide a city.')
    }else{
      dataRequest.getWeatherForecast(client, message, args).catch((e) => {
        Util.betterError(message, `weather Command -> dataRequest.getWeatherForecast -> catch e: ${e}`)
        message.channel.send("Something went wrong! Please send a issue to the developers ``+github issue``")
      })
    }
  }

  /*
  Command: server
  */
  //if (command === 'server') {
    //message.delete().catch((e) => {
      //Util.betterError(message, `server Command -> message.delete -> catch e: ${e}`)
    //})
    //message.author.send('You can join this bots discord server using this server invite link: https://discord.gg/k6qSHQs')
  //}

  /*
  Command: bot-invite
  */
  if (command === 'bot-invite') {
    message.delete().catch((e) => {
      Util.betterError(message, `bot-invite Command -> message.delete -> catch e: ${e}`)
    })
    message.author.send('Bot invite link: https://discordapp.com/oauth2/authorize?&client_id=' + config.client_id + '&scope=bot&permissions=1878522945')
  }

  /*
  Command: invite
  Description: Sends the first invite link which never expires.
  */
  if (command === 'invite') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }

    // Checking if the bot has the permission to do the action
    if(message.channel.permissionsFor(message.guild.me).has('MANAGE_GUILD')){

      // If the bot has the permission to fetch the invites of the server, it will check if
      // there are already some invites or if there are no invites.
      try {

        // Deleting message, catching any error if there is one.
        message.delete().catch((e) => {
          Util.betterError(message, `Invite Command -> Try -> message.delete -> catch e: ${e}`)
          message.channel.send("Cannot delete your message due to missing permissions.")
        })

        // Fetching invites, catching any error if there is one.
        const invites = await message.guild.fetchInvites().catch((e) => {
          Util.betterError(message, `Invite Command -> Try -> await message.guild.fetchInvites -> catch e: ${e}`)
        })

        // Sending the invite link to the user via DM.
        message.author.send(':mailbox: You can invite your friend to this discord with this invite link 👉 ' + invites.filter(invite => !invite.maxAge).first().toString())

      } catch (e) {
        // If there is no invite, the following code will be used.

        // Deleting message, catching any error if there is one.
        message.delete().catch((e) => {
          Util.betterError(message, `Invite Command -> Catch -> message.delete -> catch e: ${e}`)
          message.channel.send("Cannot delete your message due to missing permissions.")
        })

        // Creating a invite, catching any error if there is one.
        message.channel.createInvite({maxAge: 0}).catch((e) => {
          Util.betterError(message, `Invite Command -> Catch -> message.channel.createInvite -> catch e: ${e}`)
        })

        // Fetching invites, catching any error if there is one.
        const invites = await message.guild.fetchInvites().catch((e) => {
          Util.betterError(message, `Invite Command -> Catch -> await message.guild.fetchInvites -> catch e: ${e}`)
        })

        // Sending the invite link to the user via DM.
        message.author.send('I created an invite link for you! 👍 Send this to your friends to invite them! 👉 ' + invites.filter(invite => !invite.maxAge).first().toString())
      }
    }else{
      // If the bot has not the permission to do the action, it will send a message with the notification that it has no permission to do that command
      Util.betterError(message, `Invite Command -> Cannot fetch and send an invite because the bot has not the permission.`)

      // Reacting to the message, catching any error if there is one.
      message.react("👎").catch((e) => {
        Util.betterError(message, `Invite Command -> Else -> message.react -> catch e: ${e}`)
      })

      // Sending the notification
      message.channel.send("Cannot fetch the invite links of this server: Missing Permissions (MANAGE_GUILD)")
    }
  }

  /*
  Command: count-discord-member (can be changed in the next time)
  Description: Counting the members of the discord server where the command was called.
  */
  if (command === 'server-members') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    let memberAmount = message.guild.memberCount
    let lengthNumber = memberAmount.toString().length

    // Output the "10" emoji when the discord has exact 10 members
    if (memberAmount % 10 === 0) {
      message.react('🔟').catch((e) => {
       Util.betterError(message, `server-members -> msg.react (10) -> catch e: ${e}`)
      })
    } else {
      noname.loop(0, lengthNumber, memberAmount.toString(), message)
    }
    message.channel.send('On this discord server there are **' + memberAmount + '** members including yourself.')
  }

  /*
  Command: wiki
  Description: Get information from Wikipedia. Example: +wiki GitHub or +wiki Rocket League
  */
  if (command === 'wiki') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.react('👎').catch((e) => {
        Util.betterError(message, `Wiki Command -> !args[0] -> message.react -> catch e: ${e}`)
      })
      message.reply('you forgot to send us something to get data.``' + config.prefix + 'wiki [argument] | Example ' + config.prefix + 'wiki Rocket League``')
    } else {
      let searchValue = args.toString().replace(/,/g, ' ')
      let url = 'https://en.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&exintro=&titles=' + searchValue
      dataRequest.getWikipediaSummary(url, message, searchValue)
    }
  }

  /*
  Command: github
  Description: Get information about the repository and contributors.
  */
  if (command === 'github') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.reply('here you can find the repository from this bot: https://github.com/biagios/pal')
      message.channel.send({
        embed: {
          title: 'Latest stable release:',
          color: 3447003,
          description: `${config.version}`
        }
      })
    } else {
      if (args[0] === 'contributors') {
        got({
          host: 'api.github.com',
          path: '/repos/biagios/pal/contributors',
          headers: {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.38 Safari/537.36'}
        }).then(res => {
          let contributors = JSON.parse(res.body)

          let contData = []

          for (let i = 0; i < contributors.length; i++) {
            console.log(contributors[i].login)
            contData.push({name: 'Contributor', value: contributors[i].login + ' | ' + contributors[i].html_url})
          }

          message.channel.send({
            embed: {
              color: 3447003,
              title: 'GitHub -> Contributors',
              fields: contData,
              timestamp: new Date()
            }
          })
        }).catch(error => {
          console.log(error.response.body)
        })
      } else if (args[0] === 'help') {
        message.channel.send({
          embed: {
            color: 3447003,
            title: 'GitHub -> Bot commands',
            fields: [{
              name: config.prefix + 'github',
              value: 'Sends to you a link to the repository of this bot.'
            },
            {
              name: config.prefix + 'github contributors',
              value: 'Gives you a list of all contributors in the repository'
            },
            {
              name: config.prefix + 'github issue',
              value: 'Sends you a link where you can write an issue.'
            },
            {
              name: config.prefix + 'github contribute',
              value: 'Returns information about to contribute in the repo of this bot.'
            }
            ],
            timestamp: new Date()
          }
        })
      } else if (args[0] === 'issue') {
        message.channel.send({
          embed: {
            color: 3447003,
            title: 'GitHub -> Issues',
            fields: [
              {
                name: 'You´ve found a bug or have some suggestions for the bot?',
                value: 'Write it to our repository: https://github.com/biagios/pal/issues/new'
              }
            ],
            timestamp: new Date()
          }
        })
      } else if (args[0] === 'contribute') {
        message.channel.send({
          embed: {
            color: 3447003,
            title: 'GitHub -> Contribute',
            description: 'You want to contribute in our project? Check out our repo by typing ' + config.prefix + 'github to get a lookup of the project and to see what we´re planning and what we´re currently working on.',
            timestamp: new Date()
          }
        })
      } else {
        message.channel.send({
          embed: {
            color: 3447003,
            title: 'GitHub Bot Commands',
            description: 'You´ve sent a command which I can´t handle. Here you see a full list of the github commands.',
            fields: [{
              name: config.prefix + 'github',
              value: 'Sends to you a link to the repository of this bot.'
            },
            {
              name: config.prefix + 'github contributors',
              value: 'Gives you a list of all contributors in the repository'
            },
            {
              name: config.prefix + 'github issue',
              value: 'Sends you a link where you can write an issue.'
            }
            ],
            timestamp: new Date()
          }
        })
      }
    }
  }

  /*
  Command: embarrass
  Description: Will embarrass the tagged user!
  */
  if (command === 'embarrass' || command === 'embarass' || command === 'embarras' || command === 'shame' || command === 'embaras') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }

    if(message.channel.permissionsFor(message.guild.me).has('MANAGE_WEBHOOKS')){
      try {
        const things = ["I shit myself??","I'll have you know I stubbed my toe last week while watering my spice garden and I only cried for *20 minutes*",'I still don´t know how to tie shoes...', 'I stole kitkats from the store', 'My daddy still makes my bed ;(', 'I pee my trousers when i get excited :( ', 'i watch bnha unironically', 'my mom checks my phone', `Shoot! It's past my bed time!`]
        const ranactions = things[Math.floor(Math.random() * things.length)]
        const member = message.guild.member(message.mentions.members.first())
        console.log(member.user.id)
        if (member.user.id === '300955174225051650') {
          message.channel.send({embed: {
            title: "I can't embarrass myself, that's embarrassing!"
          }})
        } else {
          message.channel.createWebhook(member.user.username, member.user.avatarURL)
          .then(webhook => {
            // const emb = new Discord.WebhookClient(`${webhook.id}`, `${webhook.token}`)
            webhook.send(ranactions)
            //setTimeout(function () {
                      webhook.delete()
            //        }, 5000);
              }).catch(console.error)
        }
      } catch (e) {
        message.channel.send({embed: {
          title: ":warning: No user found in this guild with the name: ' " + args[0] + "'"
        }})
      }
    }else{
      message.reply('Error! I do not have webhook permissions!')
    }
  }

  /*
  Command: user
  Description: Lookup user data
  */
  if (command === 'user') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    // Made a try-catch because if someone is funny and tries to get data from a user which he cannot mention but still tries lmao.
    try {
      const member = message.guild.member(message.mentions.members.first())

      let userCreatedDate = Util.getDate(new Date(member.user.createdTimestamp))
      let guildJoinDate = Util.getDate(new Date(member.joinedTimestamp))
      let roles = member.roles.map((a) => {
        return a
      })

      let userLookupEmbed = new Discord.RichEmbed()
        .setAuthor('Username: ' + member.user.username, member.user.avatarURL)
        .setDescription(member.user.toString() + ' (' + member.user.tag + ')')
        .addField('Account created at:', userCreatedDate)
        .addField('Joined this server at:', guildJoinDate)
        .addField('Roles:', roles)
        .addField('ID:', member.user.id)
        .setFooter(member.user.username, member.user.avatarURL)
        .setTimestamp()
        .setColor('AQUA')

      message.channel.send({embed: userLookupEmbed})
    } catch (e) {
      message.channel.send({embed: {
        title: 'No user found in this guild with the name ' + args[0]
      }})
    }
  }

  /*
  Command: help
  Description: Gives user a list of commands the bot can do.
  */
  if (command === 'help') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    message.delete().catch((e) => {
      Util.betterError(message, `Help Command -> message.delete -> catch e: ${e}`)
      message.channel.send("Cannot delete your message due to missing permissions.")
    })
    message.author.send({
      embed: {
        color: 3447003,
        title: 'Available commands',
        description: 'Here you have a list of all commands of the bot: ',
        footer: {
          text: '- by Pal (who want to help humans 😃 )'
        },
        fields: [
          {
            name: config.prefix + 'ping',
            value: 'Calculates ping.'
          },
          {
            name: config.prefix + 'invite',
            value: 'Gives you an invite link to this discord server.'
          },
          {
            name: config.prefix + 'server-members',
            value: 'Counting the discord member of the server where the command was executed.'
          },
          {
            name: config.prefix + 'devs',
            value: 'Sends you a message with the main developers behind the bot.'
          },
          {
            name: config.prefix + 'inspire',
            value: 'Gives you an insipiring image. Provided by inspirobot.me'
          },
          {
            name: config.prefix + 'bot-invite',
            value: 'Gives you a bot invite link.'
          },
          {
            name: config.prefix + 'say',
            value: 'Repeats what you say.'
          },
          {
            name: config.prefix + 'purge',
            value: 'This command removes all messages from all users in the channel, up to 100. '
          },
          {
            name: config.prefix + 'user @user',
            value: 'Gives you information about the mentioned user.'
          },
          {
            name: config.prefix + 'server',
            value: "Gives an invite to the bot's discord."
          },
          {
            name: config.prefix + 'github',
            value: '```+github [help | contributors | issue | contribute ]```\n **!github** sends you the link to the repository.'
          },
          {
            name: config.prefix + 'crypto',
            value: '```+crypto [cryptocurrency ] [convert currency (USD, EUR, BTC, ETH, ...)]``` Returns the value of a crypto currency. Default is USD.\n'
          },
          {
            name: config.prefix + 'bitcoin [convert currency]',
            value: 'Returns the value of 1 Bitcoin. Default is USD.'
          },
          {
            name: config.prefix + 'clap',
            value: 'Clapify your text.'
          },
          {
            name: config.prefix + "weather 'city'",
            value: 'Gives you the weather info of the given city.'
          },
          {
            name: config.prefix + 'invert',
            value: 'Inverts the profile picture of the user.'
          },
          {
            name: config.prefix + 'remind',
            value: '```+remind [minutes] [text]```\n Reminds you about something you want!'
          },
          {
            name: config.prefix + 'sad-white / sad-black',
            value: 'Adds text in black / white to your profile picture.'
          },
          {
            name: config.prefix + 'embarrass @user',
            value: 'Tries to embarrass the mentioned user.'
          },
        //  {
        //    name: config.prefix + 'add',
        //    value: 'Adds a youtube link to the queue.'
        //  },
          //{
          //  name: config.prefix + 'join',
          //  value: 'Joins your vioce channel.'
        //  },
          //{
          //  name: config.prefix + 'leave',
          //  value: 'Leaves your voice channel.'
          //},
          //{
            //name: config.prefix + 'play',
            //value: 'Plays the songs in the queue.'
          //},
          {
            name: config.prefix + 'gif <search term> / giphy <search term>',
            value: 'Translating binary / text to text / binary. Try it out, its funny.'
          },
          {
            name: config.prefix + 'binary-to-text / text-to-binary',
            value: 'Translating binary / text to text / binary. Try it out, its funny.'
          },
          {
            name: config.prefix + 'http <code>',
            value: 'Sends you a funny picture of a cat with a http code from http.cat'
          },
          {
            name: config.prefix + "vent 'your vent here'",
            value: 'Uploads a vent to the vent server, vent server can be found here https://discord.gg/EBTkQHg'
          }
        ]
      }
    })
    message.author.send('**__Vent Server:__** https://discord.gg/EBTkQHg')
    // message.author.send('You can also join this bots discord server for more help using this invite link: https://discord.gg/k6qSHQs')
  }

  /*
  Command: say
  Description: Echos whatever you say in the command
  */
  if (command === 'say') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    // Makes the bot say something and delete the message. As an example, it's open to anyone but banned users to use.
    // To get the "message" itself we join the `args` back into a string with spaces:
    const sayMessage = args.join(' ')
    // Then delete the command message (sneaky, right?). The catch just ignores the error with a cute smiley thing.
    await message.delete().catch(O_o => {}) // eslint-disable-line camelcase
    // And we get the bot to say the thing:
    message.channel.send(sayMessage)
  }

  /*
  Command: bitcoin / bitcoin-price
  Description: Echos the current bitcoin value.
  */
  if (command === 'bitcoin' || command === 'bitcoin-price') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (args[0]) {
      dataRequest.getCryptoCurrencyPrice(message, 'Bitcoin', args[0])
    } else {
      dataRequest.getCryptoCurrencyPrice(message, 'Bitcoin', 'USD')
    }
  }

  /*
  Command: crypto / crypto-price
  Description: Echos the current price of a crypto currency.
  */
  if (command === 'crypto' || command === 'crypto-price') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.reply("please give me a currency to check like '__**Bitcoin**__' or '__**Ethereum-Classic**__'. \n\n" +
      'Usage: ``' + config.prefix + 'crypto [crypto currency] (e.g. Bitcoin or Ethereum-Classic) [currency] (default: USD; example: EUR, PLN, BTC, ETH ...)``')
    } else {
      if (args[1]) {
        dataRequest.getCryptoCurrencyPrice(message, args[0], args[1])
      } else {
        dataRequest.getCryptoCurrencyPrice(message, args[0], 'USD')
      }
    }
  }

  /*
  Command: gif / giphy
  Description: Searches a GIF in GIPHY with a given tag.
  */
  if (command === 'gif' || command === 'giphy') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      message.react('👎').catch((e) => {
        Util.betterError(message, `GIF / GIPHY Command -> !args[0] -> message.react -> catch e: ${e}`)
      })
      message.reply('you forgot to send us a search tag to use for searching for a gif.``' + config.prefix + 'gif [argument]``')
    } else {
      let query = args.toString().replace(/,/g, ' ')
      dataRequest.getGifFromGIPHY(message, query)
    }
  }

  /*
  Command: http
  Description: This command sends you an image of a http code cat. just try it and see it yourself. dont ask. pls
   */
  if(command === 'http'){
    if(!args[0]){
      message.channel.send({files: [ "https://http.cat/404.jpg" ]})
      message.channel.send("Powered by http.cat")
    }else {
      dataRequest.getHttpCat(message, args[0]).then(() => {
        return null
      }).catch((e) => {
        Util.betterError(message, `http Command -> dataRequest.getHttpCat -> catch e: ${e}`)
      })
    }
  }

  /*
  Command: binary-to-text
  TODO: Change command name if better one was found; Creating own translator
  Description: Translates BINARY to text
  */
  if (command === 'binary-to-text') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      return message.reply('you must give me some data to translate into text..')
    } else {
      try {
        let binary = textanary({to: 'text', data: args.toString().replace(/,/g, '')})
        return message.reply('here you go: **' + binary + '**')
      } catch (e) {
        return message.channel.send('Something went wrong... Please check your given data')
      }
    }
  }

  /*
  Command: text-to-binary
  TODO: Change command name if better one was found; Creating own translator
  Description: Translates TEXT to binary
  */
  if (command === 'text-to-binary') {
    if (bans.cbans.includes(message.author.id)) {
      message.reply('You are banned using this command.')
      return
    }
    if (!args[0]) {
      return message.reply('you must give me some data to translate into binary..')
    } else {
      try {
        let text = textanary({to: 'binary', data: args.toString().replace(/,/g, '')})
        return message.reply('here you go: **' + text + '**')
      } catch (e) {
        return message.channel.send('Something went wrong... Please check your given data')
      }
    }
  }
})

// This checks if bot is using a bot token to log in.
if (config.token) {
  //eventCall.tokenLogin(hook)
  client.login(config.token)
} else {
  // Only will happpen is error. This should only happen if the error is you dont have a bot token.
  console.log('Bot token not found! Remember you cant log in with credentials anymore.')
}
