const { app } = require('@azure/functions');
const fs = require('fs');
const path = require('path');
const { BlobServiceClient } = require("@azure/storage-blob");
const { DefaultAzureCredential } = require("@azure/identity");

app.http('deployStaticContent', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        context.log('Deploying Runkeeper to Strava sync website to Azure Storage...');

        const {
            AZ_BLOB_STORAGE_NAME,
            AZ_BLOB_STORAGE_URL,
            AZ_HTTP_FUNC_BASE_URL,
            RK2S_APP_VERSION
        } = process.env;

        const blobService = new BlobServiceClient(
            AZ_BLOB_STORAGE_URL, 
            new DefaultAzureCredential()
        );

        const container = blobService.getContainerClient(AZ_BLOB_STORAGE_NAME);
        
        // Create env.js to expose selected env vars to script
        let jsString = '';
        jsString += `const AZ_HTTP_FUNC_BASE_URL = "${AZ_HTTP_FUNC_BASE_URL}";\n`;
        jsString += `const RK2S_APP_VERSION = "${RK2S_APP_VERSION}";`;

        fs.writeFileSync(__dirname + '/static/env.js', jsString);

        
        // Loop through all files in the static directory and upload them
        // fs.readdir(__dirname + '/static', (err, files) => {

        //     files.forEach(async filename => {

        //         let mimeType;

        //         switch(path.extname(filename)) {
        //             case '.html':
        //                 mimeType = 'text/html';
        //                 break;

        //             case '.css':
        //                 mimeType = 'text/css';
        //                 break;

        //             case '.js':
        //                 mimeType = 'text/javascript';
        //                 break;

        //             case '.json':
        //                 mimeType = 'application/json';
        //                 break;

        //             case '.png':
        //                 mimeType = 'image/png';
        //                 break;

        //             default:
        //                 mimeType = 'text/html';
        //         }

        //         try {

        //             let blob = container.getBlockBlobClient(filename);

        //             await blob.uploadFile(
        //                 __dirname + '/static/' + filename,
        //                 {
        //                     blobHTTPHeaders: {
        //                         blobContentType: mimeType
        //                     }
        //                 }
        //             );

        //         } catch(err) {
        //             context.error("Error deploying push subscription website: ", err);
        //         }
                
        //     });

        // });

        return {
            body: JSON.stringify({ message: 'deployStaticContent' }),
            status: 200
        }

    }    
});
