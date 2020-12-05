/**
 * save-json.js
 *
 * Saves a JSON file containing the payload data to the filesystem
 *
 */
function saveJson(data) {
  fs = require('fs');
  fs.writeFile(
    'json/' + dateToFilename(data.activityStartTimeIso) + '.json',
    JSON.stringify(data),
    function(error) {
      console.log(error);
    }
  );
}

function dateToFilename(date) {
  const regex = /-|:|Z/gi;
  return date.replace(regex,"").replace("T","-");
}

module.exports = saveJson;
