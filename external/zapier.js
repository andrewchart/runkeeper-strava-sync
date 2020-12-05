/**
 * zapier.js
 *
 * This JS is run by Zapier in response to a new Runkeeper activity The code
 * below runs in an async function
 *
 * inoutData: JSON object containing all the data provided by the zap to the code step.
 *
 * Expected keys are:
 * activityType
 * activityStartTimeIso
 * activityNotes
 * activityPathLatitude
 * activityPathLongitude
 * activityPathTimestamp
 * activityPathType
 * apiEndpoint
 * apiSecret
 */
const API_ENDPOINT = inputData.apiEndpoint || null;
const API_SECRET = inputData.apiSecret || null;

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
