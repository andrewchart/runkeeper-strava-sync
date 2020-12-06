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

      //Check the object for the expected keys
      const validatePayload = require('./validate-payload.js');
      if(validatePayload(json) === false) {
        return reject({ message: "JSON file does not contain expected data" });
      }

      //Fetch the data template for the GPX file as a javascript object
      let template = await getJsTemplate();
      if(!template) {
        return reject({ message: "Could not get data template" });
      }

      //Populate the javascript template with data from the input json
      template = populateTemplate(template, json);

      console.log(template);


      // Resolve the promise
      return resolve({ message: "JSON successfully converted to GPX" });

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
    fs.readFile('./gpx/template.gpx', function(error, data) {
      parser.parseString(data, function (error, obj) {
       if(error) return reject({ message: "Could not convert GPX template to javascript" });
       return resolve(obj);
      });

    });
  });

}

function populateTemplate(jsTemplate, data) {

  // Require moment to parse dates
  const moment = require('moment');
  require('moment-timezone');

  // Construct a friendly name for the activity
  jsTemplate.gpx.trk.name = moment
      .tz(data.activityStartTimeIso, "Europe/London")
      .format("[" + data.activityType + " activity on] dddd Do MMMM [at] HH:mm");

  // Populate the activity start time
  jsTemplate.gpx.trk.time = data.activityStartTimeIso;

  // Add the waypoints
  let waypoints = parseWaypoints(data);
  Object.assign(jsTemplate.gpx.trk, waypoints);

  return jsTemplate;

}

function parseWaypoints(data) {
  return { foo: 'bar' };
}

function saveGpx(jsTemplate) {

}

module.exports = jsonToGpx;
