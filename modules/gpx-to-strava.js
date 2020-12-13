/**
 * gpx-to-strava.js
 *
 * Sends a gpx file from the filesystem to the Strava Uploads API endpoint.
 * @param  {String} input Reference to input filename including path
 * @return {Promise}      Resolves to a success message if the GPX file is
 *                        successfully uploaded to Strava.
 */
function gpxToStrava(input = './gpx/example.gpx') {

  return new Promise(async (resolve, reject) => {

    // Read the contents of the gpx file into memory so we can construct a name
    // and description for the Strava entry.
    const gpxFileData = await getGpxFileData(input);
    const activityName = gpxFileData.gpx.metadata[0].name[0];
    const activityDesc = gpxFileData.gpx.metadata[0].desc[0];

    // Retrieve information of the currently authenticated user
    const stravaGetAuthenticatedUser = require('./strava-get-authenticated-user.js');
    let user = await stravaGetAuthenticatedUser();

    // Form the POST request with form-data
    const FormData = require('form-data');
    let form = new FormData();
    const fs = require('fs');

    form.append("file", fs.createReadStream(input));
    form.append("name", activityName);
    form.append("description", activityDesc);
    form.append("trainer", "false");
    form.append("commute", "false");
    form.append("data_type", "gpx");

    let opts = {
      headers: {
        'Authorization': 'Bearer ' + user.access_token,
        ...form.getHeaders()
      }
    }

    // Send the POST request
    const axios = require('axios');
    const API_ENDPOINT="https://www.strava.com/api/v3/uploads";

    try {
      await axios.post(API_ENDPOINT, form, opts);
      return resolve({ status: "OK", message: "Activity successfully uploaded to Strava."});
    } catch(error) {
      return reject({ status: "ERROR", message: error });
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

module.exports = gpxToStrava;
