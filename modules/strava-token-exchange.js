/**
 * Takes a successful authorisation code or a refresh token from the Strava
 * OAuth process and privately exchanges it for a new access token and a new
 * refresh token which are stored in the App's filesystem, transiently.
 * @param  {String} code          An authorization code from the initial OAuth
 *                                authorization process.
 * @param  {String} refreshToken  A refresh token to generate a new access token
 *                                when the old one has expired.
 * @return {Promise}              Resolves to an object containing a status message
 */
function stravaTokenExchange(code=null, refreshToken=null) {

  const axios = require('axios');

  const OAUTH_URL = "https://www.strava.com/oauth/token";

  return new Promise(async (resolve, reject) => {

    // Reject if there's no code
    if(!code && !refreshToken) reject({ status: "ERROR", message: "No code or refresh token provided." });

    // Body for POST request
    let body = {
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      code: code,
      refresh_token: refreshToken,
      grant_type: (code ? 'authorization_code' : 'refresh_token')
    };

    try {
      // Request a token exchange from Strava
      let response = await axios.post(OAUTH_URL, body);

      // Attempt to write the data to a file
      await writeUser(response.data);

      resolve({ status: "OK", message: "New user successfully authenticated."});

    } catch (error) {

      reject({ status: "ERROR", message: error });

    }


  });
}

/**
 * Takes the response from Strava and writes the relevant properties to a local
 * file.
 * @param  {Object} data  Body of the response object from Strava's auth api.
 * @return {Promise}      Resolves to a success message on successful file write.
 */
function writeUser(data) {

  const fs = require('fs');
  const filename = "authorised-user-info";

  return new Promise(function(resolve, reject) {

    // Write the file
    return fs.writeFile(
      "./strava/" + filename  + ".json",
      JSON.stringify({
        "name": data.athlete.firstname + " " + data.athlete.lastname,
        "account_id": data.athlete.id,
        "access_token": data.access_token,
        "refresh_token": data.refresh_token
      }),
      'utf8',
      function(error) {
        if(error) return reject({ message: error });
        return resolve({ message: "Authorised user file successfully written." });
      }
    );

  });

}

module.exports = stravaTokenExchange;
