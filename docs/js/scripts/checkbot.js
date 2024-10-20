// Function to get cookie value by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Check for the bot detection cookie
window.onload = function() {
    const botDetected = getCookie('botDetected');
    if (botDetected) {
        // Redirect or show a restricted access message
        document.body.innerHTML = `
            <div style="text-align: center; margin-top: 20%;">
                <h1>Access Denied</h1>
                <p>You have been flagged as a bot and cannot access this site.</p>
                <p>If you think this is a mistake, contact us at <a href="mailto:support@efroai.net">support@efroai.net</a> or wait at least 24 hours.</p>
            </div>
        `;
        // Optionally redirect to a different page:
        window.location.href = '../../error/botdetected.html'; // Redirect to a restricted access page
    }
};
