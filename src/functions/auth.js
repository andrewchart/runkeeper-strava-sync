const { app } = require('@azure/functions');

const { RK2S_APP_PASSWORD } = process.env;

app.http('auth', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let { password } = request.params;
        
        let response;

        if(password === RK2S_APP_PASSWORD) {

            response = {
                body: JSON.stringify({ 
                    message: 'OK',
                    strava: 'stravaDeets',
                    cloud: 'cloudDeets' 
                }),
                status: 200 
            }

        } else {

            response = {
                body: JSON.stringify({ message: 'Incorrect credentials' }),
                status: 403
            }
            
        }

        return response;
    }
});
