# runkeeper-strava-sync

This Azure Functions app facilitates syncing of exercise activities from [Runkeeper](https://runkeeper.com/) to [Strava](https://strava.com) by polling a cloud storage location for Runkeeper activity data in json format, converting it to [GPX](https://www.topografix.com/GPX/1/1/), then uploading the GPX file to Strava as a new activity. 


## Overview
This app contains an authentication webpage where the user initially authorises the app to read from a cloud storage location (currently supported: [Microsoft OneDrive](https://onedrive.live.com/)) and interact with the Strava API.

An external service (in this case, [Zapier](https://zapier.com)) polls a private Runkeeper API for new activities. When an activity is found, Zapier converts the raw data to json format and sends it to the cloud storage location specified in the _Zap_.

This app polls the cloud storage location for new json files, converts them to valid GPX files, then sends them it to the authenticated Strava account, creating a new activity in Strava.

You can read more detail about the thinking behind the app on [my blog](https://www.andrewchart.co.uk/blog/web/development/how-to-sync-runkeeper-strava).



## Setup

### Strava

1. Within your Strava account, [create a new API application](https://developers.strava.com/docs/getting-started/#account).
2. Ensure the **Callback Domain** is set to the domain that you intend to host the _runkeeper-strava-sync_ app on.
3. Take a note of the **Client ID** and **Client Secret**. These will be used in the app's `.env` file.

### This App

Setup github secrets

Function app needs a system managed identity Storage Blob Data Contributor for the storage account.

CORS

### Zapier



## Usage


---

## Application Details

<a name="environment-variables"></a>
### Environment Variables

| process.ENV Variable | Description                                                                                        |
|----------------------|----------------------------------------------------------------------------------------------------|
| API_KEY              | A random, long string of your choosing, used as a password to keep the application private to you. |
| STRAVA_CLIENT_ID     | An integer which is given to you when you create an API application within your Strava account.    |
| STRAVA_CLIENT_SECRET | The string which is given to you as a secret key, associated with the Strava app you created.      |

### Folder Structure
_The following describes the folder structure of this application:_

    .
    ├── tbc                    # tbc
    ├── .env.example           # Example of a valid .env file
    ├── .gitignore
    ├── package-lock.json
    ├── package.json
    ├── LICENSE
    └── README.md

### Batch Upload Script
Included in the repository is a batch upload script [external/batch-upload-gpx.js](./external/batch-upload-gpx.js) designed for CLI use. This script allows you to batch upload multiple GPX files to Strava in one go.

Note that you must authenticate the main app to connect to a Strava account before using the script. You can do this by starting the main app and visiting `/strava-auth` in your browser.

Example usage:
```
$ cd external
$ node batch-upload-gpx.js /path/to/directory_containing_gpx_files
```
