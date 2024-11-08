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
// function loadCharacters() {
//     fetch(`${backendurl}/api/characters/all`) // Ensure correct string interpolation
//     .then(response => {
//         if (response.status === 429) {
//             // Show an alert message to the user
//             alert("We're sorry, but you've made too many requests in a short period of time. This is usually caused by refreshing the page too frequently or making repeated requests. Please wait 15 minutes and try again. Thank you for your patience!");
//         }
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(characters => {
//         const userToken = localStorage.getItem('token'); // Replace with your method of obtaining the token
//         adExempt = isAdExempt(userToken); // Check if the user is Ad-Exempt
//         displayCharacters(characters);
//     })
//     .catch(error => console.error('Error fetching characters:', error));
// }

function displayCharacters(characters) {
    const characterGrid = document.getElementById('character-grid');
    characterGrid.innerHTML = ''; // Clear the grid before adding new characters

    let cardCounter = 0; // Counter to keep track of the number of displayed cards
    let nextAdInterval = getRandomAdInterval(); // Get the initial ad interval
    let adLoading = false; // Flag to track ad loading

    // Function to load a single character and show it
    function showCharacter(character) {
        const card = document.createElement('div');
        card.className = 'character-card';

        const imageUrl = `${backendurl}/api/characters/${character.uploader}/images/${character.id}`;

        // Create image element
        const imgElement = document.createElement('img');
        imgElement.alt = `${character.name} image`;

        // Add the card header, body, and buttons
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

        // Insert a loading spinner while fetching the image
        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        card.querySelector('.card-body').insertBefore(spinner, card.querySelector('.card-body p'));

<<<<<<< HEAD
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

        // When the image is loaded or error occurs, remove the spinner and append the image
        imgElement.onload = () => {
            spinner.remove(); // Remove spinner once image is loaded
            card.querySelector('.card-body').insertBefore(imgElement, card.querySelector('.card-body p'));
        };
        imgElement.onerror = () => {
            spinner.remove(); // Remove spinner if image fails to load
        };
=======
            // Insert a loading spinner while fetching the image
            const spinner = document.createElement('div');
            spinner.className = 'loading-spinner';
            card.querySelector('.card-body').insertBefore(spinner, card.querySelector('.card-body p'));
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
        // Add the character card to the grid
        characterGrid.appendChild(card);
        cardCounter++; // Increment the counter after adding a card
=======
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

            // When the image is loaded or error occurs, remove the spinner and append the image
            imgElement.onload = () => {
                spinner.remove(); // Remove spinner once image is loaded
                card.querySelector('.card-body').insertBefore(imgElement, card.querySelector('.card-body p'));
            };
            imgElement.onerror = () => {
                spinner.remove(); // Remove spinner if image fails to load
            };

            // Add the character card to the grid
            characterGrid.appendChild(card);
            cardCounter++; // Increment the counter after adding a card
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
        // Check if ads should be displayed
        if (!adExempt && !adLoading && cardCounter >= nextAdInterval) {
            adLoading = true; // Prevent additional ads from loading at the same time
=======
            // Check if ads should be displayed
            if (!adExempt) {
                // Check if it's time to insert an ad
                let adLoading = false; // Track if an ad is currently loading
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            // Create an ad container
            const adContainer = document.createElement('div');
            adContainer.className = 'ad-container';
=======
                if (cardCounter >= nextAdInterval && !adLoading) {
                    adLoading = true; // Set flag to prevent additional loads
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            // Create the <ins> element for the ad
            const insElement = document.createElement('ins');
            insElement.className = 'eas6a97888e38 ins-animate';
            insElement.setAttribute('data-zoneid', '5461570');
            adContainer.appendChild(insElement);
=======
                    // Create an ad container
                    const adContainer = document.createElement('div');
                    adContainer.className = 'ad-container';
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            const keywords = 'AI chatbots,artificial intelligence,fart fetish,foot fetish,virtual companions,smart conversations,engaging chat experiences,chatbot interaction,AI conversations,creative writing,chatbot games,role-playing bots,interactive storytelling,AI humor,fictional characters,digital friends,AI personalization,online chat fun,fantasy worlds,imaginative conversations,AI art and creativity,user-centric design,gamified interactions,niche communities,whimsical chat,AI for fun,story-driven chat,dynamic dialogues,cultural conversations,quirky bots,customizable characters,AI engagement tools,character-driven narratives,interactive AI solutions,chatbot customization,playful AI,tech innovations,creative AI applications,virtual reality chat,AI writing assistance,cognitive experiences,adventurous chats,AI-driven fun,AI interaction design,charming chatbots,personalized gaming,social AI,AI in entertainment,engaging digital content,unique chat experiences,lighthearted conversations,imaginative AI characters';
            insElement.setAttribute('data-keywords', keywords);
=======
                    // Create the <ins> element for the ad
                    const insElement = document.createElement('ins');
                    insElement.className = 'eas6a97888e38 ins-animate';
                    insElement.setAttribute('data-zoneid', '5461570');
                    adContainer.appendChild(insElement);
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            // Create the ad provider script and set up loading behavior
            const scriptElement = document.createElement('script');
            scriptElement.async = true;
            scriptElement.src = 'https://a.magsrv.com/ad-provider.js';
=======
                    const keywords = 'AI chatbots,artificial intelligence,fart fetish,foot fetish,virtual companions,smart conversations,engaging chat experiences,chatbot interaction,AI conversations,creative writing,chatbot games,role-playing bots,interactive storytelling,AI humor,fictional characters,digital friends,AI personalization,online chat fun,fantasy worlds,imaginative conversations,AI art and creativity,user-centric design,gamified interactions,niche communities,whimsical chat,AI for fun,story-driven chat,dynamic dialogues,cultural conversations,quirky bots,customizable characters,AI engagement tools,character-driven narratives,interactive AI solutions,chatbot customization,playful AI,tech innovations,creative AI applications,virtual reality chat,AI writing assistance,cognitive experiences,adventurous chats,AI-driven fun,AI interaction design,charming chatbots,personalized gaming,social AI,AI in entertainment,engaging digital content,unique chat experiences,lighthearted conversations,imaginative AI characters';
                    insElement.setAttribute('data-keywords', keywords);
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
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
=======
                    // Create the ad provider script and set up loading behavior
                    const scriptElement = document.createElement('script');
                    scriptElement.async = true;
                    scriptElement.src = 'https://a.magsrv.com/ad-provider.js';
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            // Error handling to reset the flag if the script fails to load
            scriptElement.onerror = function() {
                console.error("Failed to load ad-provider.js");
                adLoading = false; // Reset flag on load failure
            };
=======
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
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            // Append the script to the ad container
            adContainer.appendChild(scriptElement);
=======
                    // Error handling to reset the flag if the script fails to load
                    scriptElement.onerror = function() {
                        console.error("Failed to load ad-provider.js");
                        adLoading = false; // Reset flag on load failure
                    };
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            // Add the ad container to the grid
            characterGrid.appendChild(adContainer);
=======
                    // Append the script to the ad container
                    adContainer.appendChild(scriptElement);
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
            // Update the interval for the next ad
            nextAdInterval = cardCounter + getRandomAdInterval();
        }
    }
=======
                    // Add the ad container to the grid
                    characterGrid.appendChild(adContainer);
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07

<<<<<<< HEAD
    // Start by displaying characters one by one as they come in
    let index = 0;
    const interval = setInterval(() => {
        if (index < characters.length) {
            showCharacter(characters[index]);
            index++;
        } else {
            clearInterval(interval); // Stop loading when all characters are shown
=======
                    // Update the interval for the next ad
                    nextAdInterval = cardCounter + getRandomAdInterval();
                }
            }
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07
        }
    }, 500); // Adjust interval time (500ms) to control speed
}

// Function to load characters from the backend
function loadCharacters() {
    fetch(`${backendurl}/api/characters/all`) // Ensure correct string interpolation
    .then(response => {
        if (response.status === 429) {
            // Show an alert message to the user
            alert("We're sorry, but you've made too many requests in a short period of time. This is usually caused by refreshing the page too frequently or making repeated requests. Please wait 15 minutes and try again. Thank you for your patience!");
        }
<<<<<<< HEAD
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
=======
    }

    // Start by loading the first batch of characters
    loadCharacters(0);
>>>>>>> dd4b8ed6f5e09a12fbe9a4990701d9d6c0749f07
}


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
