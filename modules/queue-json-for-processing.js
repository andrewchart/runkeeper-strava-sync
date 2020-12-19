/**
 * queue-json-for-processing.js
 *
 * Sets a timer which will set off the process of processing the JSON file, then
 * sending the result GPX to Strava.
 * @param  {String} filename Name of the json file to process and then send to
 *                           Strava.
 * @return {Boolean}         Returns true on success or false on failure.
 */
function queueJsonForProcessing(filename) {

  const log = require('./logger.js');

  try {

    const filePath = './json/' + filename;
    setTimeout(processJson, 10000, filePath); //arbitrarily 10 seconds

  } catch(err) {

    let error = {
      status: 500,
      message: 'Internal Server Error',
      details: `ERROR: ${err.message}`
    }

    log(error);

    return false;
  }

  return true;

}

/**
 * Executes the step by step functions to convert the JSON file to GPX, then
 * send it to Strava.
 * @param  {String} filePath Full path to the json file to be processed.
 * @return {Boolean}         Returns true on success.
 */
async function processJson(filePath) {

  const jsonToGpx = require('./json-to-gpx.js');
  const gpxToStrava = require('./gpx-to-strava.js');
  const log = require('./logger.js');

  try {

    // Convert input json to a GPX file
    let gpxFilename = await jsonToGpx(filePath);

    // Send the GPX file to Strava
    let result = await gpxToStrava('./gpx/' + gpxFilename);

    // Log the successful upload
    if(result.status === 201) {
      log({
        status: result.status,
        message: "Created",
        details: `SUCCESS: Activity ${result.data.id_str} created in Strava!`
      })
    } else {
      throw new Error(`Unable to send ${gpxFilename} to Strava`);
    }

  } catch (err) {

    let error = {
      status: 500,
      message: 'Internal Server Error',
      details: `ERROR: ${err.message}`
    }

    log(error);

    return false;

  }

}

module.exports = queueJsonForProcessing;
