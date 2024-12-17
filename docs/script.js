const apiBaseUrl = 'https://characters.efroai.net'; // Adjust as needed
let authToken = '';

function register() {
    const username = document.getElementById('register-username').value;
    const password = document.getElementById('register-password').value;

    fetch(`${apiBaseUrl}/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password, role: 'user' }),
    })
    .then(response => response.json())
    .then(data => alert(data.message))
    .catch(error => console.error('Error:', error));
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    fetch(`${apiBaseUrl}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    })
    .then(response => {
        if (!response.ok) throw new Error('Login failed');
        return response.json();
    })
    .then(data => {
        authToken = data.token;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('character-section').style.display = 'block';
        loadCharacters();
    })
    .catch(error => alert(error.message));
}

function addCharacter() {
    const name = document.getElementById('character-name').value;
    const tags = document.getElementById('character-tags').value.split(',');

    // Set the default status to 'pending'
    const status = 'pending';

    fetch(`${apiBaseUrl}/api/characters`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
          'Authorization': authToken,
        },
        body: JSON.stringify({ name, status, tags }),
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        loadCharacters();
    })
    .catch(error => alert('Error adding character: ' + error.message));
}

function loadCharacters() {
    fetch(`${apiBaseUrl}/api/characters`, {
        headers: {
            'Authorization': authToken,
        },
    })
    .then(response => response.json())
    .then(data => {
        const characterList = document.getElementById('character-list');
        characterList.innerHTML = '';
        data.forEach(character => {
            const li = document.createElement('li');
            li.textContent = `${character.name} - ${character.status}`;
            characterList.appendChild(li);
        });
    })
    .catch(error => alert('Error loading characters: ' + error.message));
}
