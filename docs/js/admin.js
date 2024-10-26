const BACKEND_URL = 'https://characters.efroai.net:3000/api'; // Define your backend URL here

document.addEventListener('DOMContentLoaded', () => {
    // Load characters from the backend
    loadCharacters();

    // Event delegation for buttons
    const characterList = document.getElementById('character-list');
    characterList.addEventListener('click', handleCharacterActions);
});

// Function to load characters from the backend
async function loadCharacters() {
    const token = sessionStorage.getItem('token'); // Get token from local storage
    if (!token) {
        console.error('No token found. User may not be logged in.');
        return; // Exit if no token is found
    }

    try {
        const response = await fetch(`${BACKEND_URL}/characters/admin`, {
            method: 'GET',
            headers: {
                'Authorization': `${token}` // Use the token here
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to load characters: ${response.statusText}`);
        }

        const characters = await response.json();
        console.log('Characters loaded:', characters); // Debugging: log the response
        displayCharacters(characters);
    } catch (error) {
        console.error('Error loading characters:', error);
    }
}

// Function to display characters in the table
function displayCharacters(characters) {
    const characterList = document.getElementById('character-list');
    characterList.innerHTML = ''; // Clear existing entries

    // Sort characters: pending first, then approved
    characters.sort((a, b) => {
        if (a.status.toLowerCase() === 'pending' && b.status.toLowerCase() !== 'pending') {
            return -1; // Move pending characters up
        }
        if (b.status.toLowerCase() === 'pending' && a.status.toLowerCase() !== 'pending') {
            return 1; // Move approved characters down
        }
        return 0; // Keep the original order for others
    });

    characters.forEach(character => {
        const row = document.createElement('tr');
        row.setAttribute('data-id', character.id);
        row.innerHTML = `
            <td>${character.name}</td>
            <td>${character.uploader}</td>
            <td><span class="status ${character.status.toLowerCase()}">${character.status}</span></td>
            <td>
                <a class="view-btn" href="admin/view-character.html?uploader=${character.uploader}&id=${character.id}">View JSON</a>
                ${character.status.toLowerCase() === 'approved'
                    ? `<button class="revoke-btn">Revoke</button>`
                    : `<button class="approve-btn">Approve</button>`
                }
                <button class="delete-btn">Delete</button>
            </td>
            <td>Not Implemented</td>
            <td>${new Date(character.dateUploaded).toLocaleDateString()}</td>
        `;
        characterList.appendChild(row);
    });
}


// Function to handle button clicks for character actions
function handleCharacterActions(event) {
    const row = event.target.closest('tr');
    if (!row) return; // Ensure there's a valid row

    const characterId = row.getAttribute('data-id');
    const uploader = row.cells[1].innerText; // Get uploader name

    if (event.target.classList.contains('approve-btn')) {
        approveCharacter(characterId, uploader); // Pass uploader to approve function
    } else if (event.target.classList.contains('revoke-btn')) {
        revokeCharacter(characterId, uploader); // Call the revoke function
    } else if (event.target.classList.contains('delete-btn')) {
        deleteCharacter(characterId, uploader);
    }
}

// Function to revoke a character's approval
async function revokeCharacter(characterId, uploader) {
    const token = sessionStorage.getItem('token'); // Get token from local storage
    if (!token) {
        console.error('No token found. User may not be logged in.');
        return; // Exit if no token is found
    }

    try {
        const response = await fetch(`${BACKEND_URL}/admin/characters/${uploader}/${characterId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `${token}`, // Use the token here
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'revoked' }) // New status
        });

        if (!response.ok) {
            throw new Error(`Failed to revoke character: ${response.statusText}`);
        }

        console.log(`Character ${characterId} revoked.`);
        loadCharacters(); // Reload characters after revocation
    } catch (error) {
        console.error('Error revoking character:', error);
    }
}

// Function to approve a character
async function approveCharacter(characterId, uploader) {
    const token = sessionStorage.getItem('token'); // Get token from local storage
    if (!token) {
        console.error('No token found. User may not be logged in.');
        return; // Exit if no token is found
    }

    try {
        const response = await fetch(`${BACKEND_URL}/admin/characters/${uploader}/${characterId}`, {
            method: 'PATCH',
            headers: {
                'Authorization': `${token}`, // Use the token here
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'approved' }) // New status
        });

        if (!response.ok) {
            throw new Error(`Failed to approve character: ${response.statusText}`);
        }

        console.log(`Character ${characterId} approved.`);
        loadCharacters(); // Reload characters after approval
    } catch (error) {
        console.error('Error approving character:', error);
    }
}

// Function to delete a character
async function deleteCharacter(characterId, uploader) {
    const token = sessionStorage.getItem('token'); // Get token from local storage
    if (!token) {
        console.error('No token found. User may not be logged in.');
        return; // Exit if no token is found
    }

    if (!confirm(`Are you sure you want to delete the character uploaded by ${uploader}?`)) {
        return; // Exit if the user cancels
    }

    try {
        const response = await fetch(`${BACKEND_URL}/admin/characters/${uploader}/${characterId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `${token}` // Use the token here
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to delete character: ${response.statusText}`);
        }

        console.log(`Character ${characterId} deleted.`);
        loadCharacters(); // Reload characters after deletion
    } catch (error) {
        console.error('Error deleting character:', error);
    }
}
