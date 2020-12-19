/**
 * gpx-to-strava.js
 *
 * Sends a gpx file from the filesystem to the Strava Uploads API endpoint.
 * @param  {String} input Reference to input filename including path.
 * @return {Promise}      Resolves to the HTTP status code and message associated
 *                        with the response from the Strava API.
 */
function gpxToStrava(input) {

  return new Promise(async (resolve, reject) => {

    try {

      if(!input) throw new Error("No GPX input file supplied.");

      // Read the contents of the gpx file into memory so we can construct a name
      // and description for the Strava entry.
      const gpxFileData = await getGpxFileData(input);
      var activityName = gpxFileData.gpx.metadata[0].name[0];
      var activityDesc = gpxFileData.gpx.metadata[0].desc[0];

      // Retrieve information of the currently authenticated user
      var stravaGetAuthenticatedUser = require('./strava-get-authenticated-user.js');
      var user = await stravaGetAuthenticatedUser();

      // Attempt to send the activity to Strava.
      var result = await uploadGpxToStrava(user.access_token, input, activityName, activityDesc);

      return resolve(result); // Indicate success to the caller

    } catch(error) {

      // If the error is an authorisation error, we'll try to refresh the access
      // token and try one more time, resolving the promise successfully if this
      // works.
      if(typeof error.response !== "undefined" && error.response.status === 401) {

        try {

          const stravaTokenExchange = require('./strava-token-exchange.js');
          await stravaTokenExchange('', user.refresh_token);

          // Get the authenticated user access token again
          var user = await stravaGetAuthenticatedUser();

          var result = await uploadGpxToStrava(user.access_token, input, activityName, activityDesc);

          return resolve(result); // Indicate success to the caller

        } catch(retry_error) {

          // If the retry error is also an authorisation error (or a bad request
          // resulting from absence of a code / token), log this explicitly.
          if(
            typeof retry_error.response !== "undefined" &&
            (retry_error.response.status === 400 || retry_error.response.status === 401)
          ) {
            return reject(
              new Error('Unable to connect to Strava account. Go to /strava-auth to reauthorise the app.')
            );
          }

          // Otherwise log the retry error message
          return reject(retry_error);

        }
      }

      // Otherwise, just reject the promise with an error
      return reject(error);
    }

  });

}

/**
 * Opens a GPX file and converts the valid XML data in it to a javascript object.
 * @param  {String} filename Full path to the GPX file.
 * @return {Promise}         Resolves to an object representing the filedata on
 *                           successful opening and parsing of the file.
 */
function getGpxFileData(filename) {

  const fs = require('fs');
  const xml2js = require('xml2js');

  return new Promise(function(resolve, reject) {

    // Read the GPX file
    return fs.readFile(filename, 'utf8', function(error, data) {
      if (error) return reject({ status: "ERROR", message: "Could not read gpx file." });

      // Convert the string contents into a javascript object
      return xml2js.parseString(data, function(error, result) {
        if(error) return reject({ status: "ERROR", message: "Could not parse gpx file." });
        return resolve(result);
      });
    });

  });
}

/**
 * Attempts to upload a new activity to Strava using a GPX file.
 * @param  {String} accessToken   The API user's current access token.
 * @param  {String} filepath      Path to the GPX file that will be uploaded.
 * @param  {String} activityName  A name for the activity on Strava.
 * @param  {String} activityDesc  Activity notes for the activity on Strava.
 * @return {Promise}              Resolves to the http status code and message
 *                                returned from the Strava API.
 */
function uploadGpxToStrava(accessToken, filepath, activityName, activityDesc) {

  return new Promise(function(resolve, reject) {

    // Form the POST request with form-data
    const FormData = require('form-data');
    let form = new FormData();
    const fs = require('fs');

    form.append("file", fs.createReadStream(filepath));
    form.append("name", activityName);
    form.append("description", activityDesc);
    form.append("trainer", "false");
    form.append("commute", "false");
    form.append("data_type", "gpx");

    let opts = {
      headers: {
        'Authorization': 'Bearer ' + accessToken,
        ...form.getHeaders()
      }
    }

    // Send the POST request
    const axios = require('axios');
    const API_ENDPOINT="https://www.strava.com/api/v3/uploads";

    return axios.post(API_ENDPOINT, form, opts).then((response) => {
      return resolve(response);
    }).catch((error) => {
      return reject(error);
    });

  });

}

module.exports = gpxToStrava;
