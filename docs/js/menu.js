
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


// Utility functions to handle JWT
const isTokenExpired = (token) => {
    if (!token) return true;
    const exp = JSON.parse(atob(token.split('.')[1])).exp;
    return exp < Math.floor(Date.now() / 1000);
};

const getUsernameFromToken = (token) => {
    return token ? JSON.parse(atob(token.split('.')[1])).username : null;
};

// Check login status and display username
document.addEventListener('DOMContentLoaded', () => {
    const token = sessionStorage.getItem('token'); // Retrieve the JWT from local storage
    const loginStatusElement = document.getElementById('login-status');
    const username = getUsernameFromToken(token);

    if (isTokenExpired(token)) {
        loginStatusElement.textContent = 'You are not logged in.';
        loginStatusElement.className = 'login-status logged-out'; // Add logged-out styling
    } else {
        loginStatusElement.textContent = `Logged in as: ${username}`;
        loginStatusElement.className = 'login-status logged-in'; // Add logged-in styling
    }
});


