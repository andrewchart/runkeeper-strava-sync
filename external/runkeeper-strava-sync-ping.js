/**
 * runkeeper-strava-sync-ping.js
 *
 * The function runs in a Microsoft Azure serverless function environment. It's
 * purpose is simply to ping the main app to keep it alive.
 *
 * Azure App Service only keeps apps in memory whilst they're in use, so if the
 * app has sat idle for a long time it will need to be instantiated again
 * whenever it is requested over http. For the runkeeper-strava-sync app it will
 * always be idle at the point at which it's requested; presumably, most people
 * are only recording 1-2 activities on Runkeeper a day, so there are several
 * hours between app uses.
 *
 * This is only a problem because Zapier also imposes a runtime execution limit
 * (of 1 second on the free tier). If Zapier doesn't receive a response from
 * the server the zap will fail. Zapier automatic retries? They're also a paid
 * feature!
 *
 * So I came to this; ping the service on a cron to keep it alive. I set up a
 * NodeJS serverless function environment, and created this function on a timer.
 *
 * The crontab value I selected (for a "Western Europe" server, taking into
 * account the fact I reside in the London GMT timezone that adjusts for British
 * summer time) was: 0 *\/30 6-22 * * *
 *
 */
module.exports = async function () {
    const https = require('https');

    https.get('https://your-app-url.example.com/', (res) => {
        return res;
    });
};
