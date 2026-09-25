const { app } = require('@azure/functions');
const fs = require('fs');

const REGISTRY = [
    'btn_strava_connect.png'
];

app.http('static', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'static/{file?}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let file = request.params.file;

        if(!file || !REGISTRY.includes(file)) {
            return {
                body: `<h1>404 Not Found</h1>`,
                status: 404,
                headers: {
                    'Content-Type': 'text/html'
                }  
            }
        }

        try {      

            return { 
                body: fs.readFileSync(__dirname + `/../static/${file}`),
                status: 200
            }

        } catch(err) {

            return {
                body: `<h1>500 Server Error</h1>`,
                status: 500,
                headers: {
                    'Content-Type': 'text/html'
                }                
            }
            
        }

    }
});