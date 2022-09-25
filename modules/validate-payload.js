/**
 * validate-payload.js
 *
 * Validates the inbound json data which is POSTed to the API
 * @param  {Object}  data Object representing incoming data from Runkeeper.
 * @return {Boolean}      True if the data is valid, otherwise false.
 */
function validatePayload(data) {

  let expectedKeys = [
    { keyName: 'activityType', required: true},
    { keyName: 'activityStartTimeIso', required: true },
    { keyName: 'activityNotes', required: false },
    { keyName: 'activityPathLatitude', required: true },
    { keyName: 'activityPathLongitude', required: true },
    { keyName: 'activityPathAltitude', required: true },
    { keyName: 'activityPathTimestamp', required: true },
    { keyName: 'activityPathType', required: true },
    { keyName: 'activityHeartRateTimestamp', required: false },
    { keyName: 'activityHeartRateBpm', required: false }
  ];

  let validPayload = true;

  // Check for any invalid keys
  let validKeyNames = expectedKeys.map(a => a.keyName);
  let dataKeyNames = Object.keys(data);

  for(i = 0; i < dataKeyNames.length; i++) {
    
    if( !validKeyNames.includes(dataKeyNames[i]) ) {
      validPayload = false;
      break;      
    }

  }

  // Check for presence of all the required keys
  for(i = 0; i < expectedKeys.length; i++) {

    expectedKeyName = expectedKeys[i].keyName;

    if(
      typeof data[expectedKeyName] === "undefined" 
      && expectedKeys[i].required === true 
    ) {
      validPayload = false;
      break;
    }

  }

  return validPayload;
}

module.exports = validatePayload;
