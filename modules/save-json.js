/**
 * save-json.js
 *
 * Saves a JSON file containing the payload data to the filesystem
 * @param  {Object} data  A javascript object containing all the data for an
 *                        activity.
 * @return {Promise}      Resolves to the filename {String} on success or {Error}
 *                        on failure.
 */
function saveJson(data) {
  fs = require('fs');

  return new Promise(function(resolve, reject) {

    // Get a filename from the activity date
    const dateToFilename = require('./date-to-filename.js');
    let filename = dateToFilename(data.activityStartTimeIso);

    // Don't allow writing of empty filenames
    if(filename.length === 0) return reject(new Error('Filename cannot be empty'));

    // Write the file
    return fs.writeFile(
      './json/' + filename + '.json',
      JSON.stringify(data),
      'utf8',
      (error) => {
        if(error) reject(error);
        else return resolve(`${filename}.json`);
      }
    );

  });
}

module.exports = saveJson;
