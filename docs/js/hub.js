const backendurl = 'https://characters.efroai.net:3000'; // Ensure this points to your backend

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
        displayCharacters(characters);
    })
    .catch(error => console.error('Error fetching characters:', error));
}

function displayCharacters(characters) {
    const characterGrid = document.getElementById('character-grid');
    characterGrid.innerHTML = ''; // Clear the grid before adding new characters

    characters.forEach((character, index) => {
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
            <button onclick="openCharacterPage('${character.id}', '${character.uploader}')">Chat</button>
            <div class="button-container">
                <button class="view-btn" onclick="viewCharacter('${character.id}')">View Character</button>
                <button class="like-btn" onclick="likeCharacter('${character.id}', '${character.uploader}')" aria-label="Like ${character.name}">
                    <span role="img" aria-hidden="true">❤️</span> <!-- Fart emoji for humor -->
                </button>
            </div>
        `;

        // Append the image element after setting the card innerHTML
        card.querySelector('.card-body').insertBefore(imgElement, card.querySelector('.card-body p'));

        characterGrid.appendChild(card);

  
        // Insert ad logic
        if ((index + 1) % 3 === 0) {
            // Randomly decide to insert 1 or 2 ads
            const numAds = Math.random() < 0.5 ? 1 : 2; // 50% chance for 1 or 2 ads

            for (let i = 0; i < numAds; i++) {
                const adContainer = document.createElement('div');
                adContainer.className = 'ad-container';

                // Create the <ins> element for the ad
                const insElement = document.createElement('ins');
                insElement.className = 'eas6a97888e2';
                insElement.setAttribute('data-zoneid', i === 0 ? '5449604' : '5449630'); // Different zone IDs
                insElement.setAttribute('data-keywords', i === 0 ? 'ai,chatbots,chatbot,fart,fart fetish, foot fetish, ai girlfriend' : 'fart, farting, foot fetish, ai, chatbot, ai girlfriend, gassy, smelly'); // Keywords for each ad

                adContainer.appendChild(insElement);

                // Insert the script tag for the ad provider
                const scriptElement = document.createElement('script');
                scriptElement.async = true;
                scriptElement.src = 'https://a.magsrv.com/ad-provider.js';
                scriptElement.onload = function() {
                    (AdProvider = window.AdProvider || []).push({"serve": {}});
                };
                document.body.appendChild(scriptElement); // Append script to body

                // Append the ad container to the grid
                characterGrid.appendChild(adContainer);
            }
        }
    });
}


function likeCharacter(characterId, uploader) {
    // Get the token from local storage (or wherever you store it)
    const token = sessionStorage.getItem('token'); // Adjust the key based on your implementation

    // Example of an AJAX request to save the like
    fetch(`${backendurl}/api/characters/${uploader}/${characterId}/like`, { // Include uploader in the URL
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `${token}` // Include the token in the Authorization header
        },
        body: JSON.stringify({ characterId: characterId }) // Sending the character ID
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to like character');
        }
        return response.json(); // Return the response as JSON
    })
    .then(data => {
        // Optionally, update the UI to reflect the like
        console.log(data.message); // Display a success message or perform other actions
        alert(data.message); // Display success or failure message
    })
    .catch(error => {
        console.error('Error liking character:', error);
        alert('Failed to like character. Please try again.'); // Simple error message
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
    //console.log('Filter function triggered'); // Debugging line
    const searchQuery = document.getElementById('search-bar').value.toLowerCase();

    // Get checked filters
    const filters = Array.from(document.querySelectorAll('.filters input[type="checkbox"]:checked')).map(filter => filter.id);

    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const tags = card.querySelector('.tags').textContent.toLowerCase();

        const matchesSearch = name.includes(searchQuery) || tags.includes(searchQuery);
        const matchesFilters = filters.length === 0 || filters.every(filter => tags.includes(filter)); // Updated logic

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
function viewCharacter(characterId) {
    // Logic to display character details (e.g., navigate to a new page or show a modal)
}
