
    // Function to get query parameters from the URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Get the username from the URL
    const username = getQueryParam('username');

    // Update the page with the username
    if (username) {
        // Set the username in the profile header
        document.querySelector('.username').textContent = username;

        // Optionally update other sections if needed
        document.querySelector('.social-section p:first-child').textContent = `Twitter: @${username}`;
        document.querySelector('.social-section p:last-child').textContent = `Website: www.${username}.com`;
    } else {
        // Handle case where username is missing
        document.querySelector('.username').textContent = "Unknown User";
    }

