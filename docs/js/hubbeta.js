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
const pageSize = 20;

let filterTerms = [];
// Function to filter characters based on search and filters
function filterCharacters() {
    const searchQuery = document.getElementById('search-input').value.toLowerCase();

    // Get checked filters and map them to their ids
    const filters = Array.from(document.querySelectorAll('.filters input[type="checkbox"]:checked'))
        .map(filter => filter.id);  // Make sure filter.id is what you expect

    // Update filterTerms with selected filters
    filterTerms = filters.flatMap(filter => filter.split(',').map(term => term.trim()));

    console.log('Selected Filters:', filterTerms);  // Debugging log to ensure filters are being gathered

    const characterCards = document.querySelectorAll('.character-card');
    characterCards.forEach(card => {
        const name = card.querySelector('h3').textContent.toLowerCase();
        const tags = card.querySelector('.tags').textContent.toLowerCase();

        const matchesSearch = name.includes(searchQuery) || tags.includes(searchQuery);

        const matchesFilters = filterTerms.length === 0 || filterTerms.some(term => tags.includes(term));

        card.style.display = matchesSearch && matchesFilters ? 'block' : 'none';
    });
}


const Fuse = require('fuse.js'); // Import Fuse.js

app.get('/api/v2/characters/all', (req, res) => {
    const { page, pageSize = 10, sortBy = 'date', searchQuery = '', filters = '' } = req.query;

    console.log(`Received request: page=${page}, pageSize=${pageSize}, sortBy=${sortBy}, searchQuery=${searchQuery}, filters=${filters}`);

    const approvedCharacters = []; // Clear approved characters before loading
    const userDirs = fs.readdirSync(charactersDir); // Read the characters directory synchronously

    // Function to parse filters into a list
    const parseFilters = (filters) => {
        console.log('Parsing filters:', filters);
        try {
            return filters ? JSON.parse(filters) : []; // Properly parse the JSON string from the query parameter
        } catch (error) {
            console.error('Error parsing filters:', error);
            return [];
        }
    };

    // Sorting function
    const sortCharacters = (characters, sortBy) => {
        console.log(`Sorting characters by: ${sortBy}`);
        switch (sortBy) {
            case 'likes':
                return characters.sort((a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)); // Sort by likes
            case 'match':
                return characters.sort((a, b) => b.matchScore - a.matchScore); // Sort by match closeness (descending)
            case 'date':
            default:
                return characters.sort((a, b) => new Date(b.dateUpdated || '1728509030') - new Date(a.dateUpdated || '1728509030')); // Sort by creation date with fallback
        }
    };

    // Function to filter characters based on the search query and filters with fuzzy matching
    const filterCharacters = (characters, searchQuery, filters) => {
        console.log('Filtering characters with searchQuery:', searchQuery, 'and filters:', filters);
        let filtered = characters;

        // Fuzzy search options for character name and description
        if (searchQuery) {
            const fuseOptions = {
                keys: ['name', 'chardescription'], // Search both name and description
                threshold: 0.3, // Fuzzy matching threshold (lower is more strict)
            };
            const fuse = new Fuse(characters, fuseOptions);
            filtered = fuse.search(searchQuery).map(result => result.item);
        }

        // Filter by additional filters (e.g., tags) with fuzzy matching
        if (filters.length > 0) {
            filtered = filtered.filter(character => {
                // Use Fuse.js for fuzzy matching of tags
                const fuseTags = new Fuse(character.tags || [], { threshold: 0.3 });
                const matchedTagsCount = filters.filter(filter => {
                    const result = fuseTags.search(filter);
                    return result.length > 0;
                }).length;
                return matchedTagsCount > 0; // Only include characters with at least one matching tag
            });

            // Sort characters by the number of matching tags
            filtered.sort((a, b) => {
                const aMatchedCount = filters.filter(filter => {
                    const result = new Fuse(a.tags || [], { threshold: 0.3 }).search(filter);
                    return result.length > 0;
                }).length;
                const bMatchedCount = filters.filter(filter => {
                    const result = new Fuse(b.tags || [], { threshold: 0.3 }).search(filter);
                    return result.length > 0;
                }).length;

                return bMatchedCount - aMatchedCount; // Sort in descending order (more matching tags comes first)
            });
        }

        // Calculate overall match score for sorting (search + filters)
        filtered = filtered.map(character => {
            const searchMatchScore = searchQuery ? new Fuse([character.name, character.chardescription], { threshold: 0.3 }).search(searchQuery).length : 0;
            const tagMatchScore = filters.length > 0 ? filters.filter(filter => {
                const fuseTags = new Fuse(character.tags || [], { threshold: 0.3 });
                return fuseTags.search(filter).length > 0;
            }).length : 0;
            const overallMatchScore = searchMatchScore + tagMatchScore; // Total score combining search and filter matches

            // Fuse.js for detailed match score calculation
            const fuse = new Fuse([character.name, character.chardescription], { threshold: 0.3 });
            const matchScore = fuse.search(searchQuery).length; // Number of matched terms
            return { character, matchScore, overallMatchScore }; // Attach both match score and overall match score
        });

        // Sort by overall match score or match score for "match" sort type
        filtered.sort((a, b) => b.matchScore - a.matchScore); // Default to sorting by "matchScore" for closeness

        console.log(`Found ${filtered.length} characters after filtering and sorting by match score`);
        return filtered.map(item => item.character); // Return the sorted characters, removing the match score
    };

    const characterPromises = userDirs.map(userDir => {
        const userCharactersDir = path.join(charactersDir, userDir);

        return new Promise((resolve, reject) => {
            fs.readdir(userCharactersDir, (err, files) => {
                if (err) {
                    console.error(`Error reading directory ${userCharactersDir}:`, err);
                    return reject('Error reading character files.');
                }

                // Process each character file
                files.forEach(file => {
                    const characterFilePath = path.join(userCharactersDir, file);

                    // Check if the file is a JSON file and not a directory
                    if (fs.statSync(characterFilePath).isFile() && path.extname(file) === '.json') {
                        try {
                            const characterData = JSON.parse(fs.readFileSync(characterFilePath));

                            // Set a default date if dateUpdated is missing
                            if (!characterData.dateUpdated) {
                                characterData.dateUpdated = '1728509030'; // Default date
                            }

                            // Check if character status is approved
                            if (characterData.status === 'approved' || characterData.status === 'automod_approved') {
                                approvedCharacters.push(characterData);
                            }
                        } catch (parseError) {
                            console.error(`Error parsing JSON from file ${file}:`, parseError.message);
                        }
                    }
                });

                resolve();
            });
        });
    });

    // Wait for all promises to resolve
    Promise.all(characterPromises)
        .then(() => {
            // Parse filters from query string
            const parsedFilters = filters ? parseFilters(filters) : [];
            console.log('Parsed filters:', parsedFilters);

            // Filter characters based on the search query and filters
            let filteredCharacters = filterCharacters(approvedCharacters, searchQuery, parsedFilters);

            // Sort filtered characters based on the query parameter
            filteredCharacters = sortCharacters(filteredCharacters, sortBy);

            // Keep trying to paginate until we have enough characters
            let paginatedCharacters = [];
            let startIndex = (page - 1) * pageSize;
            let remainingCharacters = pageSize;

            console.log(`Attempting to paginate. Start index: ${startIndex}, Remaining characters: ${remainingCharacters}`);

            while (paginatedCharacters.length < pageSize && startIndex < filteredCharacters.length) {
                const nextBatch = filteredCharacters.slice(startIndex, startIndex + remainingCharacters);
                paginatedCharacters = [...paginatedCharacters, ...nextBatch];
                startIndex += nextBatch.length;
                remainingCharacters = pageSize - paginatedCharacters.length;

                console.log(`Paginated ${nextBatch.length} characters, total so far: ${paginatedCharacters.length}`);
            }

            console.log(`Total characters returned: ${paginatedCharacters.length}`);

            // Map the characters to only include the required fields
            const mappedCharacters = paginatedCharacters.map(character => ({
                id: character.id,
                name: character.name,
                chardescription: character.chardescription, // Description
                uploader: character.uploader,
                likes: character.likes,
                tags: character.tags || [], // Empty array if no tags are available
                dateUpdated: character.dateUpdated,
                dateUploaded: character.dateUploaded,
            }));

            // Respond with paginated characters and total count
            res.json({
                characters: mappedCharacters,
                total: filteredCharacters.length, // Send total count for pagination
            });
        })
        .catch(error => {
            console.error('Error processing the request:', error);
            res.status(500).json({ message: 'Internal server error' });
        });
});




function displayCharacters(characters, searchQuery) {
    const characterGrid = document.getElementById('character-grid');

    if (currentPage === 1) {
        characterGrid.innerHTML = ''; // Clear the grid before adding new characters
    }

    let cardCounter = 0; // Counter to keep track of the number of displayed cards
    let nextAdInterval = getRandomAdInterval(); // Get the initial ad interval

    characters.forEach(character => {
        // Filter characters based on the search query
        if (character.name.toLowerCase().includes(searchQuery) || character.chardescription.toLowerCase().includes(searchQuery)) {
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

          // Check if ads should be displayed
if (!adExempt) {
    let adLoading = false; // Track if an ad is currently loading
    if (cardCounter >= nextAdInterval && !adLoading) {
        adLoading = true;

        // Create an ad container
        const adContainer = document.createElement('div');
        adContainer.className = 'ad-container';

        const insElement = document.createElement('ins');
        insElement.className = 'eas6a97888e38 ins-animate';
        insElement.setAttribute('data-zoneid', '5461570');
        adContainer.appendChild(insElement);

        // Only load the script when it's time to show the ad
        const scriptElement = document.createElement('script');
        scriptElement.async = true;
        scriptElement.src = 'https://a.magsrv.com/ad-provider.js';

        scriptElement.onload = function () {
            if (window.AdProvider) {
                window.AdProvider.push({ "serve": {} });
                console.log("Ad loaded successfully");
            } else {
                console.error("AdProvider object is not available");
            }
            adLoading = false; // Reset flag after ad loads
        };

        scriptElement.onerror = function () {
            console.error("Failed to load ad-provider.js");
            adLoading = false; // Reset flag on load failure
        };

        // Append the ad script to the ad container
        adContainer.appendChild(scriptElement);

        // Append the ad container to the character grid
        characterGrid.appendChild(adContainer);

        // Update the next ad interval
        nextAdInterval = cardCounter + getRandomAdInterval();
    }
}
        }

    });
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

