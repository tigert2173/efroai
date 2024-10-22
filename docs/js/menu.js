
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


function isTokenExpired(token) {
    if (!token) return true; // No token, it's expired
    const payload = JSON.parse(atob(token.split('.')[1])); // Decode the JWT
    const currentTime = Math.floor(Date.now() / 1000); // Get current time in seconds
    return payload.exp < currentTime; // Check if token is expired
}

function getUsernameFromToken(token) {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.username; // Assuming username is in the payload
}

document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT from local storage
    const loginStatusElement = document.getElementById('login-status'); // Assume you have an element for displaying login status

    if (isTokenExpired(token)) {
        loginStatusElement.textContent = 'You are not logged in.';
        loginStatusElement.style.display = 'none'; // Hide if not logged in
    } else {
        const username = getUsernameFromToken(token);
        loginStatusElement.textContent = `Logged in as: ${username}`;
        loginStatusElement.style.display = 'block'; // Show if logged in
    }
});

