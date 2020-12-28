/**
 * batch-upload-gpx.js
 *
 * This script can be run from the command line to send multiple GPX files to
 * Strava at once. It is good for batch uploading historical GPX files into Strava.
 *
 * Example usage: $ node batch-upload-gpx.js /path/to/folder
 *
 * Note: the main app must be authenticated with a Strava account in order to
 * use the batch processing script. If the app instance isn't authorised, you
 * will need to start (npm start) the main app, and visit /strava-auth in the
 * browser to authorise it.
 *
 */

/* START OF MAIN SCRIPT */

// Name the process for the console
const ps = 'batch-upload-gpx.js\t';
console.log(ps, 'Processing Started...');

try {

  // Require modules
  require('dotenv').config({ path: '../.env'});
  var fs = require('fs');
  var path = require('path');

  // Take the first CLI argument as the folder name
  let folder = path.resolve(process.argv[2]);

  // Check for GPX files in the folder
  let files = checkForGpxFiles(folder);

  // Check if the user is hitting Strava API limits, then process the files.
  stravaApiLimitWarning(files.length).then(async (cont) => {

    if(cont === false) return console.log(ps, 'Cancelled processing.');

    await sendGpxFilesToStrava(files);
    return console.log(ps, 'Successfully finished processing.');

  }).catch((error) => {
    return console.log(ps, `ERROR: ${error.message}`);
  });


} catch(error) {
  console.error(ps, `Processing GPX files failed: ${error.message}`);
}


/* END OF MAIN SCRIPT */


/**
 * Inspects a folder for the presence of GPX files.
 * @param  {String} folder String path to a folder to check for the presence of
 *                         GPX files.
 * @return {Array}         An array of string paths to GPX files in the given
 *                         folder.
 */
function checkForGpxFiles(folder) {

  // Check if the path to the folder is valid
  checkPath(folder);

  // Loop through files, adding only .gpx files to the array
  let filePaths = [];

  fs.readdirSync(folder).forEach(file => {

    let filePath = path.join(folder, file);

    if(!isGpx(filePath)) return;

    filePaths.push(filePath);

  });

  // Throw if there are no valid files
  if(typeof filePaths === "undefined" || !filePaths.length || !filePaths.length > 0)
    throw new Error('No GPX files to process');

  // Otherwise return an array of file paths
  console.log(ps, `Found ${filePaths.length} GPX files to process in ${folder}`);
  return filePaths;

}


/**
 * Checks a path to see if it is a directory that can be scraped for GPX files.
 * @param  {String} pathToCheck Path to validate supplied as a string.
 * @return {Boolean}            Returns true if the directory is a directory and
 *                              it exists.
 */
function checkPath(pathToCheck = null) {

  if(!pathToCheck) throw new Error('No folder supplied to search for GPX files');

  // Check the path exists
  if (!fs.existsSync(pathToCheck)) {
    throw new Error('Folder does not exist');
    return false;
  }

  // Check it's a directory
  if(!fs.lstatSync(pathToCheck).isDirectory()) {
    throw new Error('Path to folder is not a directory');
    return false;
  }

  return true;
}


/**
 * Checks an individual file is not a directory, and whether it has a GPX extension.
 * @param  {String}  filePath A string representing a path to a file to check.
 * @return {Boolean}          Returns true if the file has an extension of .gpx
 *                            and is not a directory. False otherwise.
 */
function isGpx(filePath) {

  // Return false if the path is a directory
  if(fs.lstatSync(filePath).isDirectory()) return false;

  // Only return true for files with .gpx extension
  return (path.extname(filePath) === '.gpx');

}


/**
 * Check if the number of API calls exceeds 100 (Strava's 15 minute limit). If
 * it does, prompt the user to see if they want to continue.
 * @param  {Number}  calls   The number of API calls we expect to be making.
 * @return {Promise}         Resolves to true if we wish to continue processing,
 *                           or false if we wish to cancel.
 */
function stravaApiLimitWarning(calls=0) {

  // Set up the readline prompt user dialog
  const readline = require("readline");
  var response;

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Promise to await user input before continuing.
  return new Promise((resolve, reject) => {

    // We can just continue without prompting if there are fewer than 100 files to process.
    if(calls <= 100) {
      rl.close();
      return resolve(true);
    }

    // Fire the prompt
    rl.setPrompt(
      ps + ' WARNING: The Strava API is limited to 100 requests per 15 minutes. ' +
      'You have indicated you need to process ' + calls + ' files. Do you want to ' +
      'continue? (y/n)\r\n'
    );
    rl.prompt();

    // Event listeners
    rl.on('line', (userInput) => {

      // Responses which indicate the user wants to continue
      if(userInput.toLowerCase() === 'y' || userInput.toLowerCase() === 'yes') {
        response = true;
      } else {
        response = false;
      }

      // Close the stream
      rl.close();

    });

    // Do not continue processing on a SIGINT event
    rl.on('SIGINT',() => {
      resolve(false);
      rl.close();
    });

    // Resolve the promise
    rl.on('close', () => {
      resolve(response);
    });

  });

}

/**
 * Queues multiple promises which asynchronously send GPX data to Strava.
 * @param  {Array}  files Array of strings representing file paths
 * @return {Promise}      Returns a promise that resolves when all the promises
 *                        have resolved.
 */
function sendGpxFilesToStrava(files) {

  const gpxToStrava = require('../modules/gpx-to-strava.js');

  const promises = [];

  // Loop through the files, queueing the promises for Promise.all
  files.forEach(file => {
    console.log(ps, `Sending ${file} to Strava...`);

    // Queue the promise
    promises.push(new Promise((resolve, reject) => {

      // Attempt to send to Strava
      gpxToStrava(file).then(response => {

        // Reject the promise for any non 201 response
        if(response.status !== 201) return reject(new Error(`Unable to upload ${file} to Strava`));

        console.log(ps, `SUCCESS: ${file} sent to Strava!`);

        resolve(true);

      }).catch(error => {

        reject(new Error(`Unable to upload ${file} to Strava. ${error.message}`));

      });

    }));

  });

  return Promise.all(promises);

}
