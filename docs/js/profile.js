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
            const username = params.get('username') || 'defaultUser';
    
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
    
            // Loop through each chatbot and display its details
            for (let chatbot of chatbots) {
                const imageUrl = `${backendurl}/api/characters/${username}/images/${chatbot.id}`;
    
                const sidebarCard = document.createElement('div');
                sidebarCard.classList.add('sidebar-card');
    
                const img = document.createElement('img');
                img.alt = chatbot.name;
                img.classList.add('sidebar-image');
    
                // Fetch the image as a Blob
                const imageResponse = await fetch(imageUrl, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}` // Optional: Use the auth token if needed
                    }
                });
    
                if (!imageResponse.ok) {
                    // Fallback in case image fails to load
                    img.src = 'images/noimage.jpg';
                } else {
                    // Convert the image response to a Blob
                    const imageBlob = await imageResponse.blob();
                    const imageObjectUrl = URL.createObjectURL(imageBlob);
    
                    // Set the image URL to the Blob URL
                    img.src = imageObjectUrl;
                }
    
                const name = document.createElement('p');
                name.textContent = chatbot.name;
    
                sidebarCard.appendChild(img);
                sidebarCard.appendChild(name);
                chatbotsColumn.appendChild(sidebarCard);
            }
        } catch (error) {
            console.error('Error fetching chatbots:', error);
        }
    }
    
    // Fetch chatbots on page load
    fetchUserChatbots();
    
    
