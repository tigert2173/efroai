const characterGrid = document.querySelector('.character-grid');

// Fetch characters for moderation
async function fetchCharacters() {
    try {
        const response = await fetch('https://characters.efroai.net:3000/api/characters/all'); // Assuming this endpoint fetches all characters
        if (response.ok) {
            const characters = await response.json();
            populateCharacterGrid(characters);
        } else {
            console.error('Failed to fetch characters.');
        }
    } catch (error) {
        console.error('Error fetching characters:', error);
    }
}

// Populate character grid for moderation
function populateCharacterGrid(characters) {
    characterGrid.innerHTML = ''; // Clear existing characters
    characters.forEach(character => {
        const card = document.createElement('div');
        card.classList.add('character-card');

        const header = document.createElement('div');
        header.classList.add('card-header');
        const title = document.createElement('h3');
        title.textContent = character.name;
        header.appendChild(title);

        const body = document.createElement('div');
        body.classList.add('card-body');
        body.appendChild(createCharacterInfoElement(`Uploaded by: ${character.uploader}`));
        body.appendChild(createCharacterInfoElement(`Status: ${character.status}`));
        body.appendChild(createCharacterInfoElement(`Tags: ${character.tags.join(', ')}`));

        body.appendChild(createButton('Approve', () => approveCharacter(character.id)));
        body.appendChild(createButton('Reject', () => rejectCharacter(character.id)));
        body.appendChild(createButton('Delete', () => deleteCharacter(character.id)));

        card.appendChild(header);
        card.appendChild(body);
        characterGrid.appendChild(card);
    });
}

// Create an info paragraph element
function createCharacterInfoElement(text) {
    const infoElement = document.createElement('p');
    infoElement.textContent = text;
    return infoElement;
}

// Create a button element
function createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.classList.add(`${text.toLowerCase()}-btn`);
    button.addEventListener('click', onClick);
    return button;
}

// Approve character
async function approveCharacter(id) {
    await updateCharacterStatus(id, 'approved');
}

// Reject character
async function rejectCharacter(id) {
    await updateCharacterStatus(id, 'rejected');
}

// Update character status
async function updateCharacterStatus(id, status) {
    try {
        await fetch(`https://characters.efroai.net:3000/api/characters/user/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        fetchCharacters(); // Refresh the character list
    } catch (error) {
        console.error(`Error updating character status: ${error}`);
    }
}

// Delete character
async function deleteCharacter(id) {
    if (confirm('Are you sure you want to delete this character?')) {
        try {
            await fetch(`https://characters.efroai.net:3000/api/characters/user/${id}`, {
                method: 'DELETE',
            });
            fetchCharacters(); // Refresh the character list
        } catch (error) {
            console.error('Error deleting character:', error);
        }
    }
}

// Fetch characters on page load
document.addEventListener('DOMContentLoaded', fetchCharacters);
