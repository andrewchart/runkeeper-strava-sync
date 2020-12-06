/**
 * save-json.js
 *
 * Saves a JSON file containing the payload data to the filesystem
 *
 */
function saveJson(data) {
  fs = require('fs');

  return new Promise(function(resolve, reject) {

    // Get a filename from the activity date
    let filename = dateToFilename(data.activityStartTimeIso);

    // Don't allow writing of empty filenames
    if(filename.length === 0) return reject({ message: "Filename cannot be empty"});

    // Write the file
    fs.writeFile(
      'json/' + filename + '.json',
      JSON.stringify(data),
      'utf8',
      (error) => {
        if(error) reject({ message: error });
        else resolve({ message: "File written successfully" });
      }
    );

  });
}

function dateToFilename(date) {
  const regex = /-|:|Z/gi;
  return date.replace(regex,"").replace("T","-").trim();
}

module.exports = saveJson;
