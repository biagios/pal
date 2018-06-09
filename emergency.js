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
const client = new Discord.Client()
const talkedRecently = new Set()
const config = require('./config.json')
const bans = require('./bans.json')
const vent = new Discord.WebhookClient(config.vent_id, config.vent_token)
const ventrevealer = new Discord.WebhookClient(config.vent_reveal_id, config.vent_reveal_token)
client.on('warn', console.warn)
client.on('error', console.error)
client.on('ready', () => {
  console.log('Logged in!')
  console.log('Starting Pal...\nNode version: ' + process.version + '\nDiscord.js version: ' + Discord.version)
  console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`)
  console.log('Trying to log in with token...')
})
client.on('disconnected', function () {console.error('Disconnected!')})
client.on('reconnecting', () => console.log('I am reconnecting now!'))
client.on('guildCreate', guild => {console.log(`New server joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)})
client.on('guildDelete', guild => {console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`)})
client.on('message', async message => {
  if (message.author.bot) return
  let args = message.content.slice(config.prefix.length).trim().split(/ +/g)
  const command = args.shift().toLowerCase()
  let content = message.content.toLowerCase()
  let splittedContentArgs = message.content.trim().split(/ +/g)
  let splittedContentCommand = splittedContentArgs.shift().toLowerCase()
  if (talkedRecently.has(message.author.id)) {return}
  talkedRecently.add(message.author.id)
  setTimeout(() => {talkedRecently.delete(message.author.id)}, 2500)
  if (message.channel.type === 'dm') {
    if (command === 'vent' || splittedContentCommand === 'vent') {
      if (bans.vbans.includes(message.author.id)) {
        message.reply('You are banned using this command.')
        return
      }
      if (!args[0]) {
        message.channel.send('Please provide text to send.')
        return
      }
      const rant = args.join(' ')
      message.delete().catch(O_o => {})
      vent.send(rant + ' - Anonymous')
      ventrevealer.send('Discord -> Bot -> Direct Message by ' + message.author.tag + ' ( Author ID' + message.author.id + ' | Content: ' + message.content + ')')
      message.channel.send('Message sent to #vent successfully.')
      if (rant.includes('suicide')){
        message.author.send('Pal has detected your message has to do with suicide. If you are struggling please remember you are not alone and many have gone throught the same as you. Please, if you are thinking about it refer to one of these numbers: https://en.wikipedia.org/wiki/List_of_suicide_crisis_lines')
      }
    }
  }
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
  if (command === 'ping') {
    const pings = ['the moon', 'europe', 'oceania', 'Trump', 'a baguette', 'pizza', 'the netherlands', 'September 11th, 2001', 'digital ocean', 'the BBC', 'my mother', 'Mr. Meeseeks', "pewdipie's firewatch stream", 'uncensored hentai. :warning: `not found`', 'Julian Assange', 'african food supplies, jk']
    const ranQuote = pings[Math.floor(Math.random() * pings.length)]
    const m = await message.channel.send('One second...')
    m.edit('It took ` ' + (m.createdTimestamp - message.createdTimestamp) + ' ms ` to ping ' + ranQuote + '\nAlso, the API latency is `' + Math.round(client.ping) + ' ms`')
  }
})
if (config.token) {
  client.login(config.token)
} else {
  console.log('Bot token not found! Remember you cant log in with credentials anymore.')
}
