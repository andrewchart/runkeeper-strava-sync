/**
 * strava-get-authenticated-user.js
 *
 * Reads the local json file containing information about the currently-
 * authenticated Strava user.
 * @return {Promise} Resolves to an object represented the currently-authenticated
 *                   user.
 */
async function stravaGetAuthenticatedUser() {

  const fs = require('fs');
  const path = require('path');

  return new Promise((resolve, reject) => {
    return fs.readFile(path.resolve(__dirname, '../strava/authorised-user-info.json'), { encoding: 'utf8', flag: 'a+' }, (error, data) => {

      if(error) return reject({ error: error });

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
      } finally {
        return resolve(user);
      }

    });

  });
}

module.exports = stravaGetAuthenticatedUser;
