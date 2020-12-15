/**
 * validate-api-key.js
 *
 * Checks the API key given by the app user against a sanctioned key set up by
 * the administrator of the runkeeper-strava-sync application instance.
 * @param  {String}  key API key to check.
 * @return {Boolean}     True if the keys match.
 */
function validateApiKey(key) {
  return (key === process.env.API_SECRET);
}

module.exports = validateApiKey;
