/**
 *
 * @fileoverview Functions called when an event has happened in the bot.
 * @author Julian Yaman
 *
 */


const https = require('https');


/**
 * Sends console and webhook output to the production command tool and Pal Bot Support Discord server.
 *
 * @param client
 * @param Discord
 * @param hook
 */
exports.consoleReady = (client, Discord, hook) => {
  console.log('-------------')
  console.log('Logged in!')
  console.log('Starting Pal...\nNode version: ' + process.version + '\nDiscord.js version: ' + Discord.version)
  //hook.send('Logged in!')
  //hook.send('Starting Pal-Bot:\nNode version: ' + process.version + '\nDiscord.js version: ' + Discord.version)
  console.log('-------------')
  console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`)
  //hook.send(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`)
  console.log('-------------')
}

/**
 * Function for handling the event when the bot is ready.
 * It will send the new server amount to DiscordBots.org
 * via the API by them.
 *
 * @param client - DiscordJS Client
 * @param dscrdbotsAPI_token - DiscordBots.org API Token
 */
exports.botReady = (client, dscrdbotsAPI_token) => {
  // Sending amount of servers which the bot is serving to DiscordBots.org
  let postData = JSON.stringify(
    {
      "server_count": client.guilds.size
    }
  )

  let options = {
    host: "discordbots.org",
    path: "/api/bots/300955174225051650/stats",
    method: "POST",
    headers: {
      'Authorization': dscrdbotsAPI_token,
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  }

  let request = https.request(options, function (res) {
    console.log(res)
  })

  request.write(postData)
  request.end()
}

/**
 * See function description from .consoleReady
 *
 * @param hook
 */
exports.disconnected = (hook) => {
  // Logging changes.
  console.error('Disconnected!')
  //hook.send('Disconnected!')

  // This should exit node.js with an error.
  process.exit(1)
}

/**
 * Function for handling the event when the bot is joining a new server.
 * It will log the event in the production console and sends the same
 * information as a hook message to the Pal Bot support server.
 * Furthermore, it will send the new server amount to DiscordBots.org
 * via the API by them.
 *
 * @param client - DiscordJS Client
 * @param hook - Webhook
 * @param guild - Guild from event guildCreate
 * @param dscrdbotsAPI_token - DiscordBots.org API Token
 */
exports.joinedGuild = (client, hook, /**Guild*/guild, /**String*/dscrdbotsAPI_token) => {
  // Logging changes.
  console.log(`New server joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)
  //hook.send(`New server joined: ${guild.name} (id: ${guild.id}). This guild has ${guild.memberCount} members!`)

  // Sending amount of servers which the bot is serving to DiscordBots.org
  let postData = JSON.stringify(
    {
      "server_count": client.guilds.size
    }
  )

  let options = {
    host: "discordbots.org",
    path: "/api/bots/300955174225051650/stats",
    method: "POST",
    headers: {
      'Authorization': dscrdbotsAPI_token,
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  }

  let request = https.request(options, function (res) {
    console.log(res)
  })

  request.write(postData)
  request.end()

}

/**
 * Function for handling the event when the bot is leaving a server.
 * It will log the event in the production console and sends the same
 * information as a hook message to the Pal Bot support server.
 * Furthermore, it will send the new server amount to DiscordBots.org
 * via the API by them.
 *
 * @param client - DiscordJS Client
 * @param hook - Webhook
 * @param guild - Guild from event guildDelete
 * @param dscrdbotsAPI_token - DiscordBots.org API Token
 */
exports.leftGuild = (client, hook, guild, dscrdbotsAPI_token) => {
  // Logging changes.
  console.log(`I have been removed from: ${guild.name} (id: ${guild.id})`)
  //hook.send(`I have been removed from: ${guild.name} (id: ${guild.id})`)

  // Sending amount of servers which the bot is serving to DiscordBots.org
  let postData = JSON.stringify(
    {
      "server_count": client.guilds.size
    }
  )

  let options = {
    host: "discordbots.org",
    path: "/api/bots/300955174225051650/stats",
    method: "POST",
    headers: {
      'Authorization': dscrdbotsAPI_token,
      'Content-Type': 'application/json',
      'Content-Length': postData.length
    }
  }

  let request = https.request(options, function (res) {
    console.log(res)
  })

  request.write(postData)
  request.end()
}

/**
 * @param hook
 */
exports.tokenLogin = (hook) => {
  // Log whats happening.
  console.log('-------------')
  console.log('Trying to log in with token...')
  //hook.send('Trying to log in with token...')
}
