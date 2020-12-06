/**
 * validate-payload.js
 *
 * Validates the inbound json data which is POSTed to the API
 *
 */
function validatePayload(data) {

  let expectedKeys = [
    'activityType',
    'activityStartTimeIso',
    'activityNotes',
    'activityPathLatitude',
    'activityPathLongitude',
    'activityPathTimestamp',
    'activityPathType'
  ];

  let validPayload = true;

  // Check for presence of all the keys
  for(i=0; i<expectedKeys.length; i++) {

    expected = expectedKeys[i];

    if(typeof data[expected] === "undefined") {
      validPayload = false;
      break;
    }

  }

  return validPayload;
}

module.exports = validatePayload;
