/**
 * Reads the local json file containing information about the currently-
 * authenticated Strava user.
 * @return {Object} An object represented the currently-authenticated user.
 */
async function stravaGetAuthenticatedUser() {

  const fs = require('fs');

  return new Promise((resolve, reject) => {

    return fs.readFile('./strava/authorised-user-info.json', 'utf8', (error, data) => {

      if(error) return reject({ error: error })

      let user;

      try {
        user = JSON.parse(data);
      } catch(error) {
        user = {
          name: "",
          account_id: "",
          access_token: "",
          refresh_token: ""
        };
      }

      return resolve(user);
    });
  });
}

module.exports = stravaGetAuthenticatedUser;
