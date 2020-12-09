/**
 * Constructs the required data for the strava-auth.ejs view including details
 * of the currently authenticated user (if any) and the Strava Oauth url for
 * authorising this application
 * @param  req Express request object
 * @return {Object} Data for the view
 */
async function getStravaAuthData(req) {

  return new Promise(function(resolve, reject) {

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
      scope: 'activity:write'
    }

    // Return crrently authenticated user
    return fs.readFile('./strava/authorised-user-info.json', 'utf8', (error, data) => {

      if(error) return reject({ error: error })

      let user;

      try {
        user = JSON.parse(data);
      } catch(error) {
        user = { name: "", account_id: "" };
      }

      return resolve({
        strava_oauth_url: OAUTH_URL + '?' +
                          Object.keys(query)
                                .map(key => `${key}=${query[key]}`)
                                .join('&'),
        user: user
      });
    });

  });

}

module.exports = getStravaAuthData;
