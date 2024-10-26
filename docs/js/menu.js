
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    const hamburger = document.querySelector('.hamburger');
    
    navLinks.classList.toggle('active');
    hamburger.classList.toggle('active');
}

document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
    if (document.getElementById('search-bar')) { document.getElementById('search-bar').addEventListener('input', filterCharacters); }
    if (document.getElementById('character-form')) { document.getElementById('character-form').addEventListener('submit', uploadCharacter); }
    document.querySelectorAll('.filter').forEach(filter => {
        filter.addEventListener('change', filterCharacters);
    });
});


  // Check login status and display username
  document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT from session storage
    const loginStatusElement = document.getElementById('login-status');
    const loginPopup = document.getElementById('login-popup');

    // Function to decode token and retrieve username
    const getUsernameFromToken = (token) => {
        if (!token) return null;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.username || 'Guest';
        } catch (e) {
            return null;
        }
    };

    // Function to check if the token is expired
    const isTokenExpired = (token) => {
        if (!token) return true;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    };

    const username = getUsernameFromToken(token);

    if (isTokenExpired(token)) {
        loginStatusElement.textContent = 'You are not logged in.';
        loginStatusElement.className = 'login-status logged-out'; // Add logged-out styling
        loginPopup.classList.remove('hidden'); // Show the login popup
    } else {
        loginStatusElement.textContent = `${username}`;
        loginStatusElement.className = 'login-status logged-in'; // Add logged-in styling
    }

    // Event listener for login button in the popup
    document.getElementById('login-btn').addEventListener('click', () => {
        window.location.href = '/login.html', '_blank'; // Redirect to login page
    });

    window.addEventListener('message', (event) => {
        if (event.origin === window.location.origin && event.data === 'loggedIn') {
            window.location.reload(); // Refresh the current page
        }
    });

});

