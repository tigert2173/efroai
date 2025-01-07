const backendurl = 'https://characters.efroai.net'; // Ensure this points to your backend

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
const pageSize = 50;

let filterTerms = [];
// Function to filter characters based on search and filters
function filterCharacters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    const filters = Array.from(document.querySelectorAll('.filters input[type="checkbox"]:checked'))
        .map(filter => filter.id);

    filterTerms = filters.flatMap(filter => filter.split(',').map(term => term.trim()));

    console.log('Selected Filters:', filterTerms);

    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const tags = card.querySelector('.tags').textContent.toLowerCase();
        const creator = card.querySelector('.creator').textContent.toLowerCase();

        // Ensure that both name and tags are checked correctly
        const matchesSearch = name.includes(searchQuery) || tags.includes(searchQuery) || creator.includes(searchQuery);
        const matchesFilters = filterTerms.length === 0 || filterTerms.some(term => tags.includes(term));

        card.style.display = 'block';
    });
}


// Array to store combinations of uploader name and character ID
let receivedCharacterIdentifiers = [];

// Function to load characters
function loadCharacters() {
    const sortBy = document.getElementById('sort-select').value;
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    // Collect selected filters
    const filters = filterTerms.length > 0 ? encodeURIComponent(JSON.stringify(filterTerms)) : '';

    // Send the list of received character identifiers as a comma-separated string
    const received = receivedCharacterIdentifiers.join(',');

    // Construct the URL with the filters and received character identifiers
    const url = `${backendurl}/api/v2/characters/all?page=${currentPage}&pageSize=${pageSize}&sortBy=${sortBy}&searchQuery=${encodeURIComponent(searchQuery)}&filters=${filters}&received=${received}`;

    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            totalCharacters = data.total;
            const userToken = localStorage.getItem('token'); // Replace with your method of obtaining the token
            adExempt = true; //isAdExempt(userToken); // Check if the user is Ad-Exempt
            displayCharacters(data.characters, searchQuery);

            // Update the received character identifiers with the new ones
            const newCharacterIdentifiers = data.characters.map(character => `${character.uploader}:${character.id}`);
            receivedCharacterIdentifiers = [...receivedCharacterIdentifiers, ...newCharacterIdentifiers];  // Append the new identifiers
            createLoadMoreButton();
        })
        .catch(error => console.error('Error fetching characters:', error));
}


function displayCharacters(characters, searchQuery) {
    const characterGrid = document.getElementById('character-grid');
    if (currentPage === 1) {
        characterGrid.innerHTML = ''; // Clear the grid before adding new characters
    }

    let cardCounter = 0; // Counter to keep track of the number of displayed cards
    let nextAdInterval = getRandomAdInterval(); // Get the initial ad interval

    characters.forEach(character => {
            const card = document.createElement('div');
            card.className = 'character-card';
            const imageUrl = `${backendurl}/api/characters/${character.uploader}/images/${character.id}`;

            // Create the card content
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
                <p class="creator">
                    <b>Created by:</b> 
                    <a href="profile.html?username=${encodeURIComponent(character.uploader || 'Not found')}">
                        ${character.uploader || "Not found"}
                    </a>
                </p>
                <button class="chat-btn" onclick="openCharacterPage('${character.id}', '${character.uploader}')">Chat</button>
                <div class="button-container">
                    <button class="view-btn" onclick="viewCharacter('${character.id}', '${character.uploader}')">View Character</button>
                    <button class="like-btn" onclick="likeCharacter('${character.id}', '${character.uploader}')" aria-label="Like ${character.name}">
                        <span class="heart-icon" role="img" aria-hidden="true" style="font-size: 1.4em;">❤️</span>
                        <span class="likes-count">${character.likes ? character.likes.length : 0}</span>
                    </button>
                </div>
            `;

            // Create a loading spinner element
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            card.querySelector('.card-body').insertBefore(spinner, card.querySelector('.card-body p'));

            // Create image element with lazy loading
            const imgElement = document.createElement('img');
            imgElement.alt = `${character.name} image`;

            // Use IntersectionObserver to lazy load the image when the card is visible
            const observer = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        const imageUrl = img.getAttribute('data-src'); // Get the image URL from the data-src attribute

                        console.log(`Loading image from: ${imageUrl}`);

                        // Fetch the image only when the card is in view
                        fetch(imageUrl, {
                            method: 'GET',
                            headers: {
                                'Accept': 'image/avif,image/webp,image/png,image/svg+xml,image/jpeg,image/*;q=0.8,*/*;q=0.5'
                            }
                        }).then(response => {
                            if (!response.ok) {
                                console.error(`Failed to fetch image: ${response.statusText}`);
                                img.src = 'noimage.jpg'; // Fallback to default image
                                return;
                            }
                            return response.blob();
                        }).then(imageBlob => {
                            if (imageBlob) {
                                const imageObjectURL = URL.createObjectURL(imageBlob);
                                img.src = imageObjectURL; // Set the image URL
                            }
                        }).catch(error => {
                            console.error('Error fetching image:', error);
                            img.src = 'noimage.jpg'; // Fallback to default image
                        });

                        // Once the image is loaded, remove the spinner
                        img.onload = () => {
                            spinner.remove();
                        };

                        img.onerror = () => {
                            spinner.remove(); // Remove spinner if image fails to load
                        };

                        observer.unobserve(img); // Stop observing once the image is loaded
                    }
                });
            }, { rootMargin: '200px' }); // Start loading the image when it's within 200px of the viewport

            // Set the image URL in a data-src attribute (only lazy load)
            imgElement.setAttribute('data-src', imageUrl);
            
            // Append the image element to the card (image will be loaded lazily)
            card.querySelector('.card-body').insertBefore(imgElement, card.querySelector('.card-body p'));
            
            // Start observing the image element
            observer.observe(imgElement);

            // Append the character card to the grid
            characterGrid.appendChild(card);
            cardCounter++; // Increment the counter after adding a card

            if (!adExempt) {
                let adLoading = false; // Track if an ad is currently loading
                if (cardCounter >= nextAdInterval && !adLoading) {
                    adLoading = true;
        
                    // Create an ad container
                    const adContainer = document.createElement('div');
                    adContainer.className = 'ad-container';
        
                    // Create a div for JuicyAds to render the ad into (ID should be dynamically generated)
                    const adDiv = document.createElement('ins');
                    adDiv.id = '1073761'; // Use your JuicyAds adzone ID
                    adDiv.setAttribute('data-width', '308');  // Set the ad dimensions
                    adDiv.setAttribute('data-height', '270');
        
                    // Append the div to the ad container
                    adContainer.appendChild(adDiv);
        
                    // Push the ad into the JuicyAds queue
                    (adsbyjuicy = window.adsbyjuicy || []).push({'adzone': 1073761});
        
                    // Append the ad container to the character grid
                    characterGrid.appendChild(adContainer);
        
                    // Update the next ad interval
                    nextAdInterval = cardCounter + getRandomAdInterval();
        
                    // Ensure we remove and reload the ad script
                    reloadAdScript();
                    
                    // Reset loading flag after ad load
                    adLoading = false;
                }
            }
        }
    );
}
// Function to reload the ad script (only once per load)
function reloadAdScript() {
    // Remove the existing script if it's already there
    const existingScript = document.querySelector("script[src*='jads.js']");
    if (existingScript) {
        existingScript.remove();
    }

    // Dynamically create the new script element
    const adScript = document.createElement('script');
    adScript.type = 'text/javascript';
    adScript.async = true;
    adScript.setAttribute('data-cfasync', 'false');
    adScript.src = "https://poweredby.jads.co/js/jads.js";

    // Add the ad script to the document body
    document.body.appendChild(adScript);

    // Add callback when the script is loaded
    adScript.onload = function () {
        if (window.adsbyjuicy) {
            (adsbyjuicy = window.adsbyjuicy || []).push({'adzone': 1073761});
            console.log("Ad script reloaded and ad served successfully");
        } else {
            console.error("JuicyAds object is not available");
        }
    };

    adScript.onerror = function () {
        console.error("Failed to load JuicyAds script");
    };
}


function createLoadMoreButton() {
    const loadMoreButton = document.createElement('button');
    loadMoreButton.textContent = 'Load More Characters';
    loadMoreButton.className = 'load-more-btn';

    loadMoreButton.onclick = () => {
        currentPage++;
        loadCharacters(); // Load the next page of characters
        loadMoreButton.remove(); // Remove the button after loading more
    };

    // If there are more characters, append the "Load More" button
    if (currentPage * pageSize < totalCharacters) {
        document.getElementById('character-grid').appendChild(loadMoreButton);
    }
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
    // if (document.getElementById('search-bar')) {
    //     document.getElementById('search-bar').addEventListener('input', filterCharacters);
    // }
    if (document.getElementById('character-form')) {
        document.getElementById('character-form').addEventListener('submit', uploadCharacter);
    }
});

// Initialize filter event listeners
document.querySelectorAll('.filters input[type="checkbox"]').forEach(filter => {
    filter.addEventListener('change', () => {
        filterCharacters();
        loadCharacters(); // Reload characters after filter change
    });
});

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

