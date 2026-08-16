const { app } = require('@azure/functions');

app.http('deployStaticContent', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        context.log('Deploying Runkeeper to Strava sync website to Azure Storage...');

        return { body: 0 };

    }    
});