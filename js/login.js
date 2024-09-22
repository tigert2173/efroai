const backendurl = 'https://characters.efroai.net:3000'; // Ensure this points to your backend

// Handle login form submission
document.getElementById('login-form').addEventListener('submit', (event) => {
    event.preventDefault();
    loginUser();
});

// Function to login the user
function loginUser() {
    const username = document.getElementById('login-username').value;
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
        localStorage.setItem('token', data.token); // Store token in localStorage
        
        alert('Login successful! Redirecting to homepage...');
        window.location.href = 'index.html'; // Redirect to home page or desired page
    })
    .catch(error => {
        console.error('Error during login:', error);
        alert('Failed to login. Please check your credentials.');
    });
}
