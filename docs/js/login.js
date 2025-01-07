const backendurl = 'https://characters.efroai.net'; // Ensure this points to your backend

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
        localStorage.setItem('token', data.token); // Store token in sessionStorage
          // Store user ID in a cookie
        document.cookie = `userID=${username}; path=/;`;

        // Send a message back to the original page
      //  window.opener.postMessage('loggedIn', window.location.origin);

         // Check the referrer
        const redirectUrl = document.referrer || "https://efroai.net/";
        console.log('Redirecting to:', redirectUrl); // Log the redirect URL
        
        if (redirectUrl == "https://efroai.net/chat.html") {
            window.opener.postMessage({ type: 'login', token: data.token }, window.location.origin); // Send token to the opener
            window.opener.location.href = redirectUrl; // Change the opener's location
            
            // Redirect to the referrer or homepage
            window.close(); // Optionally close the login window
        } else {
            window.location.href = 'https://efroai.net/hub.html';
        }
        //const redirectUrl = document.referrer || '../hub.html';

    })
    .catch(error => {
        console.error('Error during login:', error);
        alert('Failed to login. Please check your credentials.');
    });
}
