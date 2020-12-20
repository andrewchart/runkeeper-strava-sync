/**
 * zapier.js
 *
 * This JS is run by Zapier in response to a new Runkeeper activity The code
 * below runs in an async function
 *
 * inoutData: JSON object containing all the data provided by the zap to the code step.
 *
 * Expected keys are as per '../modules/validate-payload.js':
 * - activityType
 * - activityStartTimeIso
 * - activityNotes (optional)
 * - activityPathLatitude
 * - activityPathLongitude
 * - activityPathAltitude
 * - activityPathTimestamp
 * - activityPathType
 * - apiEndpoint
 * - apiKey
 */
const API_ENDPOINT = inputData.apiEndpoint || null;
const API_KEY = inputData.apiKey || null;

// Send the payload
const res = await fetch(API_ENDPOINT, {
  method: 'post',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(inputData)
}).catch((error) => {
  console.log(error);
});

// Parse the response
const body = await res.text();

return {
  responseCode: res.status,
  body: body
};
