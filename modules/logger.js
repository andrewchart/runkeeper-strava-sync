/**
 * logger.js
 *
 * Logs a message to a text file.
 * @param  {String|Object} message The message to log. Objects will be stringified.
 * @return {Boolean}               True on success.
 */
function logger(message) {

  if(typeof message === 'object') message = JSON.stringify(message);

  const fs = require('fs');
  const moment = require('moment');

  const filename = moment().format('YYYYMMDD') + '.log';
  const timestamp = moment().format('YYYY-MM-DD HH:mm:ss.SSS');

  let logLine = timestamp + "\t" + message + "\r\n";

  fs.writeFile(`./logs/${filename}`, logLine, { encoding: 'utf8', flag: 'a+' }, (error) => {
    if(error) return false;
    return true;
  });

}

module.exports = logger;
