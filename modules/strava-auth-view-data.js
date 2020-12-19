/**
 * strava-auth-view-data.js
 *
 * Constructs the required data for the strava-auth.ejs view including details
 * of the currently authenticated user (if any) and the Strava Oauth url for
 * authorising this application
 * @param  req       Express request object
 * @return {Object}  Data for the view
 */
async function stravaAuthViewData(req) {

  return new Promise(async (resolve, reject) => {

    const fs = require('fs');

    // Strava Oauth URL Construction
    const OAUTH_URL="https://www.strava.com/oauth/authorize";
    const query = {
      client_id: process.env.STRAVA_CLIENT_ID,
      redirect_uri: encodeURIComponent(
        'http' + (req.secure ? 's' : '') + '://' + req.headers.host + '/strava-auth/callback'
      ),
      response_type: 'code',
      approval_prompt: 'auto',
      scope: 'activity:write',
      state: encodeURIComponent(process.env.API_KEY) // Send the API key for use in the callback
    }

    // Retrieve information of the currently authenticated user, for the view
    const stravaGetAuthenticatedUser = require('./strava-get-authenticated-user.js');
    let user = await stravaGetAuthenticatedUser();

    return resolve({
      strava_oauth_url: OAUTH_URL + '?' +
                        Object.keys(query)
                              .map(key => `${key}=${query[key]}`)
                              .join('&'),
      user: user
    });

  });

}

module.exports = stravaAuthViewData;
