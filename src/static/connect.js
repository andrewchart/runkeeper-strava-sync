async function getAuthState(service) {
    let result = await fetch(`/api/auth/${service}`);
    let json = await result.json();
    json.oauth_authorize_url = json.oauth_authorize_url.replace('{{HOSTNAME}}', window.location.origin);
    return json;
}

function populateOAuthLinks(serviceStates) {
    serviceStates.forEach((connection) => {
        return document.getElementById(`${connection.service}-oauth-link`)
            .setAttribute('href', connection.oauth_authorize_url);
    });
}

function populateConnectionDetails(serviceStates) {

}



/**
 * Runtime function
 */
const init = async () => {

    // Get the auth status of each source data service and the Strava service
    let authStateCalls = [
        getAuthState('onedrive'),
        getAuthState('strava')
    ];

    const serviceStates = await Promise.all(authStateCalls);
    
    // Populate the UI with links and connection data
    populateOAuthLinks(serviceStates);
    populateConnectionDetails(serviceStates);

}

/**
 * Event listeners
 */
window.addEventListener("load", init);
