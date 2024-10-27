const backendurl = 'https://characters.efroai.net:3000'; // Ensure this points to your backend

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    loginUser();
});

// Function to login the user
function loginUser() {
    const username = document.getElementById('login-username').value.trim().toLowerCase();
    const password = document.getElementById('login-password').value;

    fetch(`${backendurl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Login failed');
        }
    })
    .then(data => {
        sessionStorage.setItem('token', data.token); // Store token in sessionStorage
          // Store user ID in a cookie
          document.cookie = `userID=${username}; path=/;`;

        // Send a message back to the original page
      //  window.opener.postMessage('loggedIn', window.location.origin);
        window.opener.postMessage({ type: 'login', token: data.token }, window.location.origin); // Send token to the opener

        // Redirect to the referrer or homepage
        const redirectUrl = document.referrer || '../index.html';
        window.opener.location.href = redirectUrl; // Change the opener's location
        window.close(); // Optionally close the login window

    })
    .catch(error => {
        console.error('Error during login:', error);
        alert('Failed to login. Please check your credentials.');
    });
}
