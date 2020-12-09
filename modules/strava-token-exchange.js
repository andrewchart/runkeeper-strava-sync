/**
 * Takes a successful authorisation code from the Strava OAuth process and
 * privately exchanges it for an access token and a refresh token which are
 * stored in the App's filesystem, transiently.
 * @param  {[type]} code [description]
 * @return {Promise}     Resolves to 
 */
function stravaTokenExchange(code) {
  return new Promise(function(resolve, reject) {
    resolve({});
  });
}

module.exports = stravaTokenExchange;
