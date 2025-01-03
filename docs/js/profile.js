const backendurl = 'https://characters.efroai.net'; // Ensure this points to your backend

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
        //document.querySelector('.social-section p:first-child').textContent = `Twitter: @${username}`;
        document.querySelector('.social-section p:last-child').textContent = `Website: www.${username}.com`;
    } else {
        // Handle case where username is missing
        document.querySelector('.username').textContent = "Unknown User";
    }


    // TO FETCH USER BOTS \\

     // Function to fetch and display the user's chatbots
async function fetchUserChatbots() {
    try {
        // Get the username from the URL
        const params = new URLSearchParams(window.location.search);
        const username = params.get('usernae') || 'defaultUser'; // Fallback to 'defaultUser'

        // Display the username in the header
        const usernameElement = document.querySelector('.username');
        usernameElement.textContent = username;

        // Fetch the user's chatbots
        const response = await fetch(`${backendurl}/api/characters`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with your auth mechanism
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch chatbots');
        }

        const chatbots = await response.json();

        // Display the chatbots
        const chatbotsColumn = document.querySelector('.chatbots-column');
        const chatbotList = chatbots.map(chatbot => `
            <div class="sidebar-card">
                <img src="${backendurl}/api/characters/${username}/images/${chatbot.id}" alt="${chatbot.name}" class="sidebar-image" onerror="this.src='images/noimage.jpg'">
                <p>${chatbot.name}</p>
            </div>
        `).join('');

        chatbotsColumn.innerHTML += chatbotList;
    } catch (error) {
        console.error('Error fetching chatbots:', error);
    }
}

// Fetch chatbots on page load
fetchUserChatbots();
