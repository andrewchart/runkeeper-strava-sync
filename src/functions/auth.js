const { app } = require('@azure/functions');

const OAUTH_SERVICES = [
    'onedrive',
    'strava'
];

const {
    MS_CLIENT_ID,
    MS_CLIENT_SECRET,
    STRAVA_CLIENT_ID,
    STRAVA_CLIENT_SECRET,
    WEBSITE_HOSTNAME
} = process.env;

app.http('auth', {
    methods: ['GET'],
    authLevel: 'anonymous',
    route: 'api/auth/{service:alpha?}',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        let { service } = request.params;

        if(!service || !OAUTH_SERVICES.includes(service)) {
            return {
                body: `<h1>404 Not Found</h1>`,
                status: 404,
                headers: {
                    'Content-Type': 'text/html'
                }  
            }
        }

        return {
            body: JSON.stringify(new AuthResponse(service)),
            status: 200
        }
       

    }
});

function AuthResponse(service) {
    this.service = service;

    switch(service) {
        case 'onedrive':
            Object.assign(this, new OneDriveAuthResponse());
            break;
        case 'strava':
            Object.assign(this, new StravaAuthResponse());
            break;
    }   
}

function OneDriveAuthResponse() {
    this.oauth_authorize_url = constructOauthAuthorizationURL('onedrive');
}

function StravaAuthResponse() {
    this.oauth_authorize_url = constructOauthAuthorizationURL('strava');
}


function constructOauthAuthorizationURL(service) {
    let baseUrl, query;

    switch(service) {
        case 'onedrive':
            baseUrl="https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize";

            query = {
                client_id: MS_CLIENT_ID,
                redirect_uri: `${getUriProtocol()}${WEBSITE_HOSTNAME}/api/auth/onedrive/callback`,
                response_type: 'code',
                scope: 'Files.ReadWrite'
            }           
            break;

        case 'strava':
            baseUrl="https://www.strava.com/oauth/authorize";

            query = {
                client_id: STRAVA_CLIENT_ID,
                redirect_uri: `${getUriProtocol()}${WEBSITE_HOSTNAME}/api/auth/strava/callback`,
                response_type: 'code',
                approval_prompt: 'auto',
                scope: 'activity:write'
            }
            break;
    }

    let queryString = Object.keys(query)
                            .map(key => `${key}=${query[key]}`)
                            .join('&');

    return `${baseUrl}?${queryString}`;
}

function getUriProtocol() {
    if(WEBSITE_HOSTNAME.match(/^localhost/gi)) return 'http://';
    return 'https://';
}