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
    //document.querySelector('.social-section p:last-child').textContent = `Website: www.${username}.com`;
} else {
    // Handle case where username is missing
    document.querySelector('.username').textContent = "Unknown User";
}

fetchProfileImage(username);

// TO FETCH USER BOTS \\
async function fetchUserChatbots() {
    try {
        const params = new URLSearchParams(window.location.search);
        const username = params.get('username') || 'defaultUser';

        // Display the username in the header
        const usernameElement = document.querySelector('.username');
        usernameElement.textContent = username;

        // Fetch the user's chatbots
        const response = await fetch(`${backendurl}/api/public/${username}/characters`, {
            headers: {
              //  'Authorization': `Bearer ${localStorage.getItem('token')}` // Replace with your auth mechanism
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

            // Append image and name to the sidebar card
            sidebarCard.appendChild(img);
            sidebarCard.appendChild(name);

            // Add click event listener to open the character's chat page
            sidebarCard.addEventListener('click', () => {
                // Open character chat details (redirect to view-character.html)
                viewCharacter(chatbot.id, username);
            });

            chatbotsColumn.appendChild(sidebarCard);
        }
    } catch (error) {
        console.error('Error fetching chatbots:', error);
    }
}

// Function to view character details (can be implemented further)
function viewCharacter(characterId, uploader) {
    // Logic to display character details (e.g., navigate to a new page or show a modal)
    window.location.href = `/view-character.html?uploader=${encodeURIComponent(uploader)}&characterId=${encodeURIComponent(characterId)}`;
}

// Fetch chatbots on page load
fetchUserChatbots();

// Function to fetch user badges based on username
async function getUserBadges(username) {
    try {
        const response = await fetch(`https://characters.efroai.net/api/user/${username}/perks/get-badges`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch badges');
        }

        const data = await response.json();
        displayBadges(data.badges);
    } catch (error) {
        console.error('Error fetching badges:', error);
        const badgesSection = document.getElementById('badges-section');
        badgesSection.innerHTML = '<p>Could not load badges. Please try again later.</p>';
    }
}

// Function to display badges on the page with particles
function displayBadges(badges) {
    const badgesSection = document.getElementById('badges-section');
    badgesSection.innerHTML = ''; // Clear any existing badges

    if (badges && badges.length > 0) {
        badges.forEach(badge => {
            const badgeWrapper = document.createElement('div');
            badgeWrapper.classList.add('badge-wrapper');

            const badgeElement = document.createElement('span');
            badgeElement.classList.add('badge');
            badgeElement.textContent = badge; // Set badge text

            // Apply specific class and particles if applicable
            switch (badge.toLowerCase()) {
                case 'founder':
                    badgeElement.classList.add('supporter', 'particle-cloud');
                    break;
                case 'dev-team':
                    badgeElement.classList.add('donor');
                    break;
                case 'admin':
                    badgeElement.classList.add('contest-winner', 'particle-cloud');
                    break;
                default:
                    badgeElement.classList.add('unknown-badge');
            }

            badgeWrapper.appendChild(badgeElement);
            badgesSection.appendChild(badgeWrapper);

            // Add particles for specific badges
            if (badgeElement.classList.contains('particle-cloud')) {
                createCloudParticles(badgeWrapper);
            }
        });
    } else {
        badgesSection.innerHTML = '<p>No badges available for this user.</p>';
    }
}

// Function to create cloud-like particles around a badge
function createCloudParticles(parentElement) {
    const particleCount = 20; // Number of particles
    const radius = 50; // Radius of the particle cloud

    for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * 2 * Math.PI; // Random angle
        const distance = Math.random() * radius; // Random distance from center
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;

        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${50 + x}%`; // Center the cloud
        particle.style.top = `${50 + y}%`;
        parentElement.appendChild(particle);
    }
}

getUserBadges(username);

