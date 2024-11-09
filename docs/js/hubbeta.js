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

let currentPage = 1;
let totalCharacters = 0;
const pageSize = 10;

function loadCharacters() {
    const sortBy = document.getElementById('sort-select').value; // Get sorting option from UI (likes or date)
    const searchQuery = document.getElementById('search-input').value.toLowerCase(); // Get search query

    // Fetch characters from the backend with current page and page size
    fetch(`${backendurl}/api/v2/characters/all?page=${currentPage}&pageSize=${pageSize}&sortBy=${sortBy}&searchQuery=${encodeURIComponent(searchQuery)}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            totalCharacters = data.total;
            displayCharacters(data.characters, searchQuery); // Display the filtered characters
            createLoadMoreButton(); // Create the "Load More" button if needed
        })
        .catch(error => console.error('Error fetching characters:', error));
}

function createLoadMoreButton() {
    // Create the "Load More" button only if more characters are available
    if (currentPage * pageSize < totalCharacters) {
        const loadMoreButton = document.createElement('button');
        loadMoreButton.textContent = 'Load More Characters';
        loadMoreButton.className = 'load-more-btn';

        loadMoreButton.onclick = () => {
            currentPage++; // Increment page number for the next set of characters
            loadCharacters(); // Load the next page of characters
        };

        // Add the load more button to the character grid
        document.getElementById('character-grid').appendChild(loadMoreButton);
    }
}

function displayCharacters(characters, searchQuery) {
    const characterGrid = document.getElementById('character-grid');

    if (currentPage == 1) {
        characterGrid.innerHTML = ''; // Clear the grid before adding new characters
    }

    characters.forEach(character => {
        // Only display characters that match the search query
        if (character.name.toLowerCase().includes(searchQuery) || character.chardescription.toLowerCase().includes(searchQuery)) {
            const card = document.createElement('div');
            card.className = 'character-card';

            const imageUrl = `${backendurl}/api/characters/${character.uploader}/images/${character.id}`;
            const imgElement = document.createElement('img');
            imgElement.alt = `${character.name} image`;

            // Set up card content (same as your existing implementation)
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
                    <button class="like-btn" onclick="likeCharacter('${character.id}', '${character.uploader}')" aria-label="Like ${character.name}">
                        <span class="heart-icon" role="img" aria-hidden="true" style="font-size: 1.4em;">❤️</span>
                        <span class="likes-count">${character.likes ? character.likes.length : 0}</span>
                    </button>
                </div>
            `;

            // Add image loading and spinner code here (same as before)
            // Insert spinner and fetch image

            characterGrid.appendChild(card);
        }
    });
}


let typingTimer; 
const doneTypingInterval = 500; // time in ms (0.5 seconds)

document.getElementById('search-input').addEventListener('input', () => {
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
        loadCharacters(); // Reload characters based on the search query
        currentPage = 1; // Reset to the first page when searching
    }, doneTypingInterval);
});
// Sorting functionality
document.getElementById('sort-select').addEventListener('change', () => {
    currentPage = 1; // Reset to the first page when sorting
    loadCharacters(); // Reload characters based on the selected sorting option
});


// Function to get a random ad interval between 5 and 10
function getRandomAdInterval() {
    return Math.floor(Math.random() * (10 - 5 + 1)) + 5; // Returns a random number between 5 and 10
}


function likeCharacter(characterId, uploader) {
    // Get the token from local storage (or wherever you store it)
    const token = localStorage.getItem('token'); // Adjust the key based on your implementation

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
