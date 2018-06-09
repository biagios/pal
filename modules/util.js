/**
 *
 * @fileoverview Here are all functions which make our life much easier.
 * @author Julian Yaman
 *
 */

/**
 * Returns a formatted time string with a millisecond timestamp.
 *
 * @param value - The number you want to round.
 * @param precision - Precision of the decimal number.
 * @since masterAfter-1.3
 *
 * @private
 */
// Thanks Billy Moon for giving the answer how to make a more precise round function: https://stackoverflow.com/a/7343013
exports.roundNumber = (/** Number */ value, /** Integer */ precision) => {
  let multiplier = Math.pow(10, precision || 0)
  return Math.round(value * multiplier) / multiplier
}

/**
 * Returns a formatted time string with a millisecond timestamp.
 *
 * @param date - Game to be set for the bot.
 * @since 1.0.1
 *
 * @public
 */
exports.getDate = function (/** Object */date) {
  /* We can use this later
  let hours = date.getHours();
  let minutes = "0" + date.getMinutes();
  let seconds = "0" + date.getSeconds();
  */
  return date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear()
}

/**
 * Better solution for logging errors
 *
 * @param msg - Message object
 * @param text - Text which should be sent in the console
 * @since master
 *
 * @public
 *
 */
exports.betterError = (/**Message*/msg, /**String*/text) => {
  console.log(`(${msg.guild.name} | ${msg.guild.id}) ${text}`)
}

/**
 * Buffer function
 *
 * @param err
 * @param buffer
 * @since masterAfter-1.3
 *
 * @private
 */
exports.onBuffer = (err, buffer) => {
  if (err) throw err
  console.log(buffer)
}
