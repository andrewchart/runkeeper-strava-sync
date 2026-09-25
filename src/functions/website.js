const { app } = require('@azure/functions');

const fs = require('fs');

const { RK2S_APP_PASSWORD } = process.env;

app.http('home', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: '/',
    handler: async (request, context) => {
        
        context.log(`Http function processed request for url "${request.url}"`);

        return { 
            body: fs.readFileSync(__dirname + `/../views/home.html`),
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8'
            }
        }

    }
});


app.http('connect', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {

        context.log(`Http function processed request for url "${request.url}"`);

        const password = (await request.formData()).get('password');
    
        if(password === RK2S_APP_PASSWORD) {

            return { 
                body: fs.readFileSync(__dirname + `/../views/connect.html`),
                status: 200,
                headers: {
                    'Content-Type': 'text/html; charset=utf-8'
                }
            }

        } else {

            return {
                body: `<h1>403 Unauthorized</h1>`,
                status: 403,
                headers: {
                    'Content-Type': 'text/html'
                }  
            }
            
        }

    }
});
