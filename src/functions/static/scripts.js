/* Page Element Definitions */
const loginForm = document.getElementById('loginForm');

loginForm.onsubmit = login;

function login() {
    
    event.preventDefault();

    return fetch(`${AZ_HTTP_FUNC_BASE_URL}/api/auth`, {
        method: 'post',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            password: loginForm.password.value
        })
    });

}