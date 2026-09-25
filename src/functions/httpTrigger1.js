const { app } = require('@azure/functions');

app.http('httpTrigger1', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const name = request.query.get('name') || await request.text() || 'world';

        return { 
            body: `<h1>Hello, ${name}!</h1><img src="/api/static/btn_strava_connect.png" />`,
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        
        };
    }
});
