/**
 * json-to-gpx.js
 *
 * Converts a json file to a gpx file
 * @param  {String} filePath Reference to input filename including path.
 * @return {Promise}         Resolves to the filename of the created GPX file on
 *                           success.
 */
function jsonToGpx(filePath) {
  fs = require('fs');
  xml2js = require('xml2js');

  return new Promise(function(resolve, reject) {

    return fs.readFile(filePath, 'utf8', async function(error, data) {

      if (error) return reject(error);

      try {

        // Parse the json to an object
        var json = JSON.parse(data);

        // Check the object for the expected keys
        const validatePayload = require('./validate-payload.js');
        if(validatePayload(json) === false) throw new Error("Invalid json supplied to jsonToGpx.");

        // Fetch the data template for the GPX file as a javascript object
        let template = await getJsTemplate();

        // Populate the javascript template with data from the input (as json),
        // resulting in a final javascript object from which to construct the
        // output xml.
        let result = populateTemplate(template, json);

        // Convert the result back to XML and write to disk.
        let gpxFilename = await saveGpx(result);
        return resolve(gpxFilename);

      } catch(error) {
        return reject(error);
      }

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

      if(error) return reject(error);

      return parser.parseString(data, function (error, obj) {
        if(error) return reject(error);
        return resolve(obj);
      });

    });

  });

}

/**
 * Takes the javascript object representing the GPX template, and appends actual
 * activity data to the object, based upon the input data from the json file.
 * @param  {Object} jsTemplate  Javascript representation of the GPX template.
 * @param  {Object} data        Data about the activity including waypoints and
 *                              activity start time in UTC format.
 * @return {Object}             Returns the populated gpx data for conversion
 *                              from JS to XML.
 */
function populateTemplate(jsTemplate, data) {

  // Require moment to parse dates
  const moment = require('moment');
  require('moment-timezone');

  // Construct a friendly name for the activity from London time
  jsTemplate.gpx.metadata[0].name = moment
      .tz(data.activityStartTimeIso, "Europe/London")
      .format("[" + data.activityType + " activity on] dddd Do MMMM YYYY [at] HH:mm");

  // Activity type
  const mapActivityType = require('./map-activity-type.js');
  jsTemplate.gpx.trk[0].type = mapActivityType(data.activityType);

  // Activity notes
  jsTemplate.gpx.metadata[0].desc = data.activityNotes;

  // Populate the activity start time
  jsTemplate.gpx.metadata[0].time = data.activityStartTimeIso;

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

  // Convert the activity PathType, PathLongitude, PathLatitude, PathAltitude
  // and PathTimestamp data (csv strings) into arrays. The data in the arrays
  // will be assumed to have array indexes which 'line up' to form a waypoint
  // (trkpt XML node).
  let pathTypes, pathLongitudes, pathLatitudes, pathAltitudes, pathTimestamps;
  pathTypes = data.activityPathType.split(',');
  pathLongitudes = data.activityPathLongitude.split(',');
  pathLatitudes = data.activityPathLatitude.split(',');
  pathAltitudes = data.activityPathAltitude.split(',')
  pathTimestamps = data.activityPathTimestamp.split(',').map(a => parseFloat(a));

  // If we have received optional heart rate data, convert these into their own
  // arrays. There is one array for the timestamp, and one for the BPM. Again,
  // we have to assume the indexes line up and the entries come in time order.
  let hasHeartRateData = false, heartRateTimestamps, heartRateBpms;
  if(
    typeof data.activityHeartRateTimestamp === 'string'
    && typeof data.activityHeartRateBpm === 'string'
  ) {
    hasHeartRateData = true;
    heartRateTimestamps = data.activityHeartRateTimestamp.split(',').map(a => parseFloat(a));
    heartRateBpms = data.activityHeartRateBpm.split(',').map(a => parseInt(a));
  }

  // Iterate over the waypoints
  pathTypes.forEach((point, i) => {

    // If we have heart rate data, construct the extended data for the waypoint
    let extensions = null;
    if(hasHeartRateData === true) {
      extensions = {
        'extensions' : {
          'gpxtpx:TrackPointExtension' : {
            'gpxtpx:hr': getNearestHeartRateMeasurement(
              pathTimestamps[i], 
              heartRateTimestamps, 
              heartRateBpms
            )
          }
        }
      }
    }

    // Start a new segment for waypoints marked "start" or "resume"
    if(point === 'start' || point === 'resume') {
      trkseg.push({ trkpt: [] });
      trksegCounter++;
    }

    // Construct data for the point within the trkseg segment. Note that the 
    // timestamp is UTC, relative to the start time.
    let trkptData = {
      '$': {
        lat: pathLatitudes[i],
        lon: pathLongitudes[i]
      },
      'ele': pathAltitudes[i],
      'time': moment.utc(data.activityStartTimeIso).add(pathTimestamps[i], 'seconds').format()
    }

    // Append the extension data to the trkpt. Object.assign means we won't 
    // send an empty node when there is no extention data (as it skips over 
    // the null)
    trkptData = Object.assign(trkptData, extensions);

    // Add the track point to the segment
    trkseg[trksegCounter].trkpt.push(trkptData);

  });

  return trkseg;
}

/**
 * Get the heart rate measurement (in beats per minute) that is nearest to the
 * given timestamp. The function looks for the most recent heartrate with a 
 * timestamp before (less than) the input timestamp.
 * @param  {Float}  timestamp           Timestamp in seconds.
 * @param  {Array}  heartRateTimestamps Array of timestamps we have heart rate 
 *                                      measurements for.
 * @param  {Array}  heartRateBpms       Corresponding array of BPMs.
 * @return {Integer}                    Nearest heart rate to the timestamp in 
 *                                      Beats Per Minute (BPM).
 */
 function getNearestHeartRateMeasurement(timestamp, heartRateTimestamps, heartRateBpms) {

  let lowIndex = 0, midIndex, highIndex = heartRateTimestamps.length - 1;

  while(highIndex - lowIndex > 1) {
    midIndex = Math.floor((lowIndex + highIndex) / 2);

    // Jackpot! There is a heart rate value for this time exactly. Just return it.
    if(timestamp === heartRateTimestamps[midIndex]) {
      return heartRateBpms[midIndex];
    } 
    
    // If the timestamp is greater than or the same as the final heartrate time,
    // return the last heartrate BPM.
    else if (timestamp >= heartRateTimestamps[highIndex]) {
      return heartRateBpms[highIndex];
    }

    // Otherwise we gunna do some binary searching!
    if(timestamp > heartRateTimestamps[midIndex]) {
      lowIndex = midIndex;
    } else {
      highIndex = midIndex;
    }
  }

  // We want the lower of the two values that the timestamp falls between
  return heartRateBpms[lowIndex];
 }

/**
 * Converts the populated javascript object into a string of XML then aaves the
 * XML in GPX format, to a file in the filesystem.
 * @param  {Object} jsTemplate Completed object containing activity data.
 * @return {Promise}           Resolves to a string containing the filename that
 *                             was written to the filesystem.
 */
function saveGpx(jsTemplate) {

  return new Promise(function(resolve, reject) {

    // Get a filename from the activity date
    const dateToFilename = require('./date-to-filename.js');
    var filename = dateToFilename(jsTemplate.gpx.metadata[0].time) + '.gpx';

    // Don't allow writing of empty filenames
    if(filename.length === 0) return reject(new Error("Filename cannot be empty"));

    // Convert JS to XML
    var builder = new xml2js.Builder({
      xmldec: { 'version': '1.0', 'encoding': 'UTF-8' },
      cdata: true
    });
    var xml = builder.buildObject(jsTemplate);

    // Write the file
    return fs.writeFile(
      "./gpx/" + filename,
      xml,
      'utf8',
      function(error) {
        if(error) return reject(error);
        return resolve(filename);
      }
    );

  });

}

module.exports = jsonToGpx;
