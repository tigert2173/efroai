const backendurl = 'https://characters.efroai.net:3000'; // Ensure this points to your backend

// Function to decode JWT and check for the Ad-Exempt claim
function isAdExempt(token) {
    if (!token) return false; // If there's no token, assume not exempt

    // Decode the JWT (assuming it's a standard JWT with 3 parts)
    const payload = token.split('.')[1]; // Get the payload part
    const decodedPayload = JSON.parse(atob(payload)); // Decode base64 URL and parse as JSON

    return decodedPayload['AdExempt'] === true; // Check the Ad-Exempt claim
}

let adExempt = false // Check if the user is Ad-Exempt

// Function to load characters from the backend
function loadCharacters() {
    fetch(`${backendurl}/api/characters/all`) // Ensure correct string interpolation
    .then(response => {
        if (response.status === 429) {
            // Show an alert message to the user
            alert("We're sorry, but you've made too many requests in a short period of time. This is usually caused by refreshing the page too frequently or making repeated requests. Please wait 15 minutes and try again. Thank you for your patience!");
        }
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(characters => {
        const userToken = localStorage.getItem('token'); // Replace with your method of obtaining the token
        adExempt = isAdExempt(userToken); // Check if the user is Ad-Exempt
        displayCharacters(characters);
    })
    .catch(error => console.error('Error fetching characters:', error));
}

function displayCharacters(characters) {
    const characterGrid = document.getElementById('character-grid');
    characterGrid.innerHTML = ''; // Clear the grid before adding new characters

    let cardCounter = 0; // Counter to keep track of the number of displayed cards
    let nextAdInterval = getRandomAdInterval(); // Get the initial ad interval
    const batchSize = 50; // Number of characters to display at once

    function loadCharacters(startIndex) {
        const endIndex = Math.min(startIndex + batchSize, characters.length);
        for (let i = startIndex; i < endIndex; i++) {
            const character = characters[i];
            const card = document.createElement('div');
            card.className = 'character-card';

            const imageUrl = `${backendurl}/api/characters/${character.uploader}/images/${character.id}`;

            // Create image element
            const imgElement = document.createElement('img');
            imgElement.alt = `${character.name} image`;
            imgElement.onerror = () => {
                imgElement.src = 'noimage.jpg'; // Set default image on error
            };

            // Fetch the image
            fetch(imageUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'image/avif,image/webp,image/png,image/svg+xml,image/jpeg,image/*;q=0.8,*/*;q=0.5'
                }
            }).then(response => {
                if (!response.ok) {
                    console.error(`Failed to fetch image: ${response.statusText}`);
                    imgElement.src = 'noimage.jpg'; // Fallback to default image
                    return;
                }
                return response.blob();
            }).then(imageBlob => {
                if (imageBlob) {
                    const imageObjectURL = URL.createObjectURL(imageBlob);
                    imgElement.src = imageObjectURL;
                }
            }).catch(error => {
                console.error('Error fetching image:', error);
                imgElement.src = 'noimage.jpg'; // Fallback to default image
            });

            // Add the inner HTML to the card
            card.innerHTML = `
                <div class="card-header">
                    <h3>${character.name}</h3>
                </div>
                <div class="card-body">
                    <p>${character.chardescription || 'Error: Description is missing.'}</p>
                </div>
                <p class="tags">
                    ${character.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                    <span class="full-tags-overlay">
                        ${character.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}
                    </span>
                </p>
                <p class="creator"><b>Created by:</b> ${character.uploader || "Not found"}</p>
                <button class="chat-btn" onclick="openCharacterPage('${character.id}', '${character.uploader}')">Chat</button>
                <div class="button-container">
                    <button class="view-btn" onclick="viewCharacter('${character.id}', '${character.uploader}')">View Character</button>
                   <button class="like-btn" id="like-btn-${character.id}" onclick="likeCharacter('${character.id}', '${character.uploader}')" aria-label="Like ${character.name}">
                        <span class="heart-icon" role="img" aria-hidden="true" style="font-size: 1.4em;">❤️</span>
                        <span class="likes-count">${character.likes ? character.likes.length : 0}</span>
                    </button>
                </div>
            `;

            // Append the image element after setting the card innerHTML
            card.querySelector('.card-body').insertBefore(imgElement, card.querySelector('.card-body p'));

            characterGrid.appendChild(card);
            cardCounter++; // Increment the counter after adding a card
// Check if ads should be displayed
if (!adExempt) {
    // Check if it's time to insert an ad
    let adLoading = false; // Track if an ad is currently loading

    if (cardCounter >= nextAdInterval && !adLoading) {
        adLoading = true; // Set flag to prevent additional loads

        // Create an ad container
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-container';

        // Create the <ins> element for the ad
        const insElement = document.createElement('ins');
        insElement.className = 'eas6a97888e38 ins-animate';
        insElement.setAttribute('data-zoneid', '5461570');
        adContainer.appendChild(insElement);

        const keywords = 'AI chatbots,artificial intelligence,fart fetish,foot fetish,virtual companions,smart conversations,engaging chat experiences,chatbot interaction,AI conversations,creative writing,chatbot games,role-playing bots,interactive storytelling,AI humor,fictional characters,digital friends,AI personalization,online chat fun,fantasy worlds,imaginative conversations,AI art and creativity,user-centric design,gamified interactions,niche communities,whimsical chat,AI for fun,story-driven chat,dynamic dialogues,cultural conversations,quirky bots,customizable characters,AI engagement tools,character-driven narratives,interactive AI solutions,chatbot customization,playful AI,tech innovations,creative AI applications,virtual reality chat,AI writing assistance,cognitive experiences,adventurous chats,AI-driven fun,AI interaction design,charming chatbots,personalized gaming,social AI,AI in entertainment,engaging digital content,unique chat experiences,lighthearted conversations,imaginative AI characters';
        insElement.setAttribute('data-keywords', keywords);

        // Create the ad provider script and set up loading behavior
        const scriptElement = document.createElement('script');
        scriptElement.async = true;
        scriptElement.src = 'https://a.magsrv.com/ad-provider.js';

        // Only call push() when the script is fully loaded
        scriptElement.onload = function() {
            // Ensure the AdProvider object exists
            if (window.AdProvider) {
                window.AdProvider.push({"serve": {}});
                console.log("Ad loaded successfully");
            } else {
                console.error("AdProvider object is not available");
            }
            adLoading = false; // Reset flag after ad loads
        };

        // Error handling to reset the flag if the script fails to load
        scriptElement.onerror = function() {
            console.error("Failed to load ad-provider.js");
            adLoading = false; // Reset flag on load failure
        };

        // Append the script to the ad container
        adContainer.appendChild(scriptElement);

        // Add the ad container to the grid
        characterGrid.appendChild(adContainer);

        // Update the interval for the next ad
        nextAdInterval = cardCounter + getRandomAdInterval();
    }

            }
        }

        // Create a "Load More" button if there are more characters to load
        if (endIndex < characters.length) {
            const loadMoreButton = document.createElement('button');
            loadMoreButton.textContent = 'Load More Characters';
            loadMoreButton.className = 'load-more-btn';
        
            loadMoreButton.onclick = () => {
                loadCharacters(endIndex); // Load the next batch of characters
                loadMoreButton.remove(); // Remove the button after loading more
            };
        
            // Append the button to the grid
            characterGrid.appendChild(loadMoreButton);
        }
    }        

    // Start by loading the first batch of characters
    loadCharacters(0);
}

// Function to get a random ad interval between 5 and 10
function getRandomAdInterval() {
    return Math.floor(Math.random() * (10 - 5 + 1)) + 5; // Returns a random number between 5 and 10
}

function likeCharacter(characterId, uploader) {
    const token = localStorage.getItem('token'); // Get the token from local storage
    if (!token) {
        alert("You must be logged in to like a character.");
        return; // Exit if not logged in
    }

    const likeButton = document.querySelector(`#like-btn-${characterId}`); // Get the like button for the character card
    const heartIcon = likeButton.querySelector('.heart-icon'); // Get the heart icon element
    const likesCountElement = likeButton.querySelector('.likes-count'); // Get the likes count element

    // Check if the heart is already red (i.e., liked)
    const isLiked = heartIcon.innerHTML === '❤️'; // Check if the heart is solid red

    // Define the URL for the like/unlike action
    const url = `${backendurl}/api/characters/${uploader}/${characterId}/like`;

    // Perform the like/unlike action
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}` // Make sure token is prefixed with 'Bearer'
        },
        body: JSON.stringify({ characterId: characterId })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to update like status');
        }
        return response.json();
    })
    .then(data => {
        // Update the heart icon and like count based on the like status
        if (isLiked) {
            heartIcon.innerHTML = '🤍'; // Change to hollow heart if already liked
        } else {
            heartIcon.innerHTML = '❤️'; // Change to solid heart if not liked
        }
        likesCountElement.textContent = data.likes ? data.likes.length : 0; // Update like count
    })
    .catch(error => {
        console.error('Error updating like status:', error);
        alert('Failed to update like status. Please try again.');
    });
}





function openCharacterPage(characterId, uploader) {
    // Use sessionStorage to save the character ID and uploader information
    sessionStorage.setItem('selectedCharacterId', characterId);
    sessionStorage.setItem('characterUploader', uploader);

    // Redirect to the chat page
    window.location.href = '/chat.html';
}

document.addEventListener('DOMContentLoaded', () => {
    loadCharacters();
    if (document.getElementById('search-bar')) {
        document.getElementById('search-bar').addEventListener('input', filterCharacters);
    }
    if (document.getElementById('character-form')) {
        document.getElementById('character-form').addEventListener('submit', uploadCharacter);
    }

    // Initialize filter event listeners
    document.querySelectorAll('.filters input[type="checkbox"]').forEach(filter => {
        filter.addEventListener('change', filterCharacters);
    });
});

// Function to filter characters based on search and filters
function filterCharacters() {
    const searchQuery = document.getElementById('search-bar').value.toLowerCase();

    // Get checked filters
    const filters = Array.from(document.querySelectorAll('.filters input[type="checkbox"]:checked'))
        .map(filter => filter.id);

    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const tags = card.querySelector('.tags').textContent.toLowerCase();

        const matchesSearch = name.includes(searchQuery) || tags.includes(searchQuery);

        // Split filters by comma and trim whitespace
        const filterTerms = filters.flatMap(filter => filter.split(',').map(term => term.trim()));
        const matchesFilters = filterTerms.length === 0 || filterTerms.some(term => tags.includes(term));

        card.style.display = matchesSearch && matchesFilters ? 'block' : 'none';
    });
}

// Function to show upload character form
function showUploadForm() {
    document.getElementById('upload-form').style.display = 'block'; // Ensure this ID matches your HTML
}

// Function to hide upload character form
function hideUploadForm() {
    document.getElementById('upload-form').style.display = 'none';
}

// Function to view character details (can be implemented further)
function viewCharacter(characterId, uploader) {
    // Logic to display character details (e.g., navigate to a new page or show a modal)
    window.location.href = `/view-character.html?uploader=${encodeURIComponent(uploader)}&characterId=${encodeURIComponent(characterId)}`;
}
