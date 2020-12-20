/**
 * Converts a Runkeeper activityType string into a string that is recognised by
 * Strava.
 * @param  {String} activityType Runkeeper activityType
 * @return {String}              Strava activityType.
 */
function mapActivityType(activityType) {

  const map = {
    "Cycling": "Ride",
    "Running": "Run",
    "Walking": "Walk"
  }

  if(typeof map[activityType] === "undefined") {
    return "Run";
  } else {
    return map[activityType];
  }

}

module.exports = mapActivityType;
