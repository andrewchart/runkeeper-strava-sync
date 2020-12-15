/**
 * strava-token-exchange.js
 *
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

      // If this is a refresh request, get the name and account ID of the user
      // from the existing authenticated user json file.
      let name, account_id;

      if(refreshToken) {
        const stravaGetAuthenticatedUser = require('./strava-get-authenticated-user.js');
        let user = await stravaGetAuthenticatedUser();
        name = user.name;
        account_id = user.account_id;
      }

      // Otherwise, get the name and account ID from the API response
      else {
        name = response.data.athlete.firstname + " " + response.data.athlete.lastname;
        account_id = response.data.athlete.id;
      }

      // Attempt to write the data to a file
      await writeUser(
        name,
        account_id,
        response.data.access_token,
        response.data.refresh_token
      );

      return resolve({ status: "OK", message: "New user successfully authenticated."});

    } catch (error) {

      return reject({ status: "ERROR", message: error });

    }

  });
}

/**
 * Writes details about the authenticated user to a local file.
 * @param  {String}  name           Name of the authenticated user
 * @param  {Integer} account_id     Strava account ID for the authenticated user
 * @param  {String}  access_token   Most recent access token for the API
 * @param  {String}  refresh_token  Refresh token used when the access token has
 *                                  expired.
 * @return {Promise}                Resolves to a success message on successful
 *                                  file write.
 */
function writeUser(name, account_id, access_token, refresh_token) {

  const fs = require('fs');

  return new Promise(function(resolve, reject) {

    // Write the file
    return fs.writeFile(
      "./strava/authorised-user-info.json",
      JSON.stringify({
        "name": name,
        "account_id": account_id,
        "access_token": access_token,
        "refresh_token": refresh_token
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
