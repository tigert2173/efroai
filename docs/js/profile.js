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

    async function fetchUserChatbots() {
        try {
            const params = new URLSearchParams(window.location.search);
            const username = params.get('user') || 'defaultUser';
    
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
                throw new Error(`Failed to fetch chatbots: ${response.statusText}`);
            }
    
            const chatbots = await response.json();
    
            const chatbotsColumn = document.querySelector('.chatbots-column');
            chatbotsColumn.innerHTML = ''; // Clear any previous content
    
            chatbots.forEach(chatbot => {
                const imageUrl = `${backendurl}/api/characters/${username}/images/${chatbot.id}`;
                const sidebarCard = document.createElement('div');
                sidebarCard.classList.add('sidebar-card');
    
                const img = document.createElement('img');
                img.src = imageUrl;
                img.alt = chatbot.name;
                img.classList.add('sidebar-image');
    
                // Handle fallback for image errors
                img.onerror = () => {
                    img.src = 'images/noimage.jpg';
                };
    
                const name = document.createElement('p');
                name.textContent = chatbot.name;
    
                sidebarCard.appendChild(img);
                sidebarCard.appendChild(name);
                chatbotsColumn.appendChild(sidebarCard);
            });
        } catch (error) {
            console.error('Error fetching chatbots:', error);
        }
    }
    
    // Fetch chatbots on page load
    fetchUserChatbots();
    
