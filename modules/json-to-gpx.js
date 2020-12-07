/**
 * json-to-gpx.js
 *
 * Converts a json file to a gpx file
 *
 */
function jsonToGpx(input) {
  fs = require('fs');
  xml2js = require('xml2js');

  return new Promise(function(resolve, reject) {

    return fs.readFile(input, 'utf8', async function(error, data) {

      // Parse the json to an object
      if (error) {
        console.error(error);
        return reject({ message: "Could not read file" });
      }

      var json = JSON.parse(data);

      // Check the object for the expected keys
      const validatePayload = require('./validate-payload.js');
      if(validatePayload(json) === false) {
        return reject({ message: "JSON file does not contain expected data" });
      }

      // Fetch the data template for the GPX file as a javascript object
      let template = await getJsTemplate();
      if(!template) {
        return reject({ message: "Could not get data template" });
      }

      // Populate the javascript template with data from the input (as json),
      // resulting in a final javascript object from which to construct the
      // output xml.
      result = populateTemplate(template, json);

      // Convert the result back to XML and write to disk.
      saveGpx(result).then(function() {
        return resolve({ message: "JSON successfully converted to GPX" });
      }).catch(function() {
        return reject({ message: "Could not save GPX file to filesystem." });
      });

    });

  });

}


/**
 * Gets the XML template file and parses it into a javascript object
 * @return {Object} Javascript object representing the XML structure of the GPX
 *                  template (XML) file.
 */
function getJsTemplate() {

  var parser = new xml2js.Parser();

  return new Promise(function(resolve, reject) {
    return fs.readFile('./gpx/template.gpx', function(error, data) {
      parser.parseString(data, function (error, obj) {
       if(error) return reject({ message: "Could not convert GPX template to javascript" });
       return resolve(obj);
      });

    });
  });

}

/**
 * [populateTemplate description]
 * @param  {[type]} jsTemplate [description]
 * @param  {[type]} data       [description]
 * @return {[type]}            [description]
 */
function populateTemplate(jsTemplate, data) {

  // Require moment to parse dates
  const moment = require('moment');
  require('moment-timezone');

  // Construct a friendly name for the activity from London time
  jsTemplate.gpx.trk[0].name = moment
      .tz(data.activityStartTimeIso, "Europe/London")
      .format("[" + data.activityType + " activity on] dddd Do MMMM [at] HH:mm");

  // Populate the activity start time
  jsTemplate.gpx.trk[0].time = data.activityStartTimeIso;

  // Add the waypoints
  jsTemplate.gpx.trk[0].trkseg = parseWaypoints(data);

  return jsTemplate;
}

/**
 * Creates an array of waypoint segments. Each segment represents a continual
 * period of movement on an activity, and contains a number of trkpt objects.
 * @param  {Object} data JSON data containing waypoint lat, lng, ele and time
 * @return {Array}       An array of trkseg nodes as javascript objects
 */
function parseWaypoints(data) {

  const moment = require('moment');

  let trkseg = [];

  // For every waypoint with a type of "start" we need to start a new trkseg
  // node in the XML. This counter keeps track of which trkseg node to append
  // the waypoint to (zero index).
  let trksegCounter = -1;

  // Convery the activity PathType, PathLongitude, PathLatitude, PathAltitude
  // and PathTimestamp data (csv strings) into arrays. The data in the arrays
  // will be assumed to have array indexes which 'line up' to form a waypoint
  // (trkpt XML node).
  let pathTypes, pathLongitudes, pathLatitudes, pathAltitudes, pathTimestamps;
  pathTypes = data.activityPathType.split(',');
  pathLongitudes = data.activityPathLongitude.split(',');
  pathLatitudes = data.activityPathLatitude.split(',');
  pathAltitudes = data.activityPathAltitude.split(',')
  pathTimestamps = data.activityPathTimestamp.split(',');

  // Iterate over the waypoints
  pathTypes.forEach((point, i) => {

    // Start a new segment for waypoints marked "start"
    if(point === 'start') {
      trkseg.push({ trkpt: [] });
      trksegCounter++;
    }

    // Record the point within the trkseg segment. Note that the timestamp is
    // UTC, relative to the start time.
    trkseg[trksegCounter].trkpt.push({
      '$': {
        lat: pathLatitudes[i],
        lon: pathLongitudes[i]
      },
      'ele': pathAltitudes[i],
      'time': moment.utc(data.activityStartTimeIso).add(pathTimestamps[i], 'seconds').format()
    });

  });

  return trkseg;
}

/**
 * [saveGpx description]
 * @param  {[type]} jsTemplate [description]
 * @return {[type]}            [description]
 */
function saveGpx(jsTemplate) {

  // Get a filename from the activity date
  const dateToFilename = require('./date-to-filename.js');
  const filename = dateToFilename(jsTemplate.gpx.trk[0].time);

  // Don't allow writing of empty filenames
  if(filename.length === 0) return reject({ message: "Filename cannot be empty" });

  return new Promise(function(resolve, reject) {

    // Convert JS to XML
    var builder = new xml2js.Builder({
      xmldec: { 'version': '1.0', 'encoding': 'UTF-8' },
      cdata: true
    });
    var xml = builder.buildObject(jsTemplate);

    // Write the file
    return fs.writeFile(
      "./gpx/" + filename  + ".gpx",
      xml,
      'utf8',
      function(error) {
        if(error) return reject({ message: error });
        return resolve({ message: "GPX file successfully written" });
      }
    );

  });

}

module.exports = jsonToGpx;
