
function toggleMenu() {
    const navLinks = document.querySelector('.nav-links');
    navLinks.classList.toggle('active');
}

// Toggle dropdown on mobile
function toggleDropdown(event) {
    if (window.innerWidth <= 768) { // Adjust based on your mobile breakpoint
        event.preventDefault(); // Prevents navigation
        const dropdownContent = event.target.nextElementSibling;
        dropdownContent.classList.toggle('show'); // Toggle display
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    if (searchBar && searchBar.offsetParent !== null && !searchBar.disabled) {
        searchBar.addEventListener('input', filterCharacters);
    }

    const characterForm = document.getElementById('character-form');
    if (characterForm && characterForm.offsetParent !== null && !characterForm.disabled) {
        characterForm.addEventListener('submit', uploadCharacter);
    }

    document.querySelectorAll('.filter').forEach(filter => {
        if (filter.offsetParent !== null && !filter.disabled) {
            filter.addEventListener('change', filterCharacters);
        }
    });
});
document.getElementById('login-status').addEventListener('click', function () {
    if (this.classList.contains('logged-out')) {
        window.location.href = '/login.html'; // Redirect to the login page
    }
});

  // Check login status and display username
  document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token'); // Retrieve the JWT from session storage
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
        loginStatusElement.textContent = 'Click to login.';
        loginStatusElement.className = 'login-status logged-out'; // Add logged-out styling
        loginPopup.style.display = 'flex'; // Show the login popup
    } else {
        loginStatusElement.textContent = `${username}`;
        loginStatusElement.className = 'login-status logged-in'; // Add logged-in styling
      //  loginPopup.style.display = 'none'; // Hide the login popup
    }

    // Get the login button element
    const loginButton = document.getElementById('login-btn');

    // Only add the event listener if the login button is defined
    if (loginButton) {
        // Event listener for login button in the popup
        loginButton.addEventListener('click', () => {
            // Redirect to the login page in a new tab
            const loginWindow = window.open('/login.html', '_blank');
        });
    }
    // Listen for messages from the login window
    window.addEventListener('message', (event) => {
        if (event.origin === window.location.origin) {
            if (event.data.type === 'login' && event.data.token) {
                sessionStorage.setItem('token', event.data.token); // Store the token
                location.reload(); // Refresh the page to apply the new token
            }
        }
    });

});

