// Fetch bots awaiting approval
function fetchBots() {
    const token = localStorage.getItem('token');

    fetch('https://characters.efroai.net:3000/api/bots/pending', {
        method: 'GET',
        headers: {
            'Authorization': token
        }
    })
    .then(response => response.json())
    .then(data => {
        const botsList = document.getElementById('botsList');
        botsList.innerHTML = ''; // Clear previous entries

        data.bots.forEach(bot => {
            const row = document.createElement('tr');
            row.innerHTML = `
            <td>${bot.name}</td>
            <td>${bot.owner}</td>
            <td>${bot.status}</td>
            <td>
            <button onclick="approveBot('${bot.id}')">Approve</button>
            <button onclick="denyBot('${bot.id}')">Deny</button>
            </td>
            `;
            botsList.appendChild(row);
        });
    })
    .catch(error => console.error('Error fetching bots:', error));
}

// Approve a bot
function approveBot(botId) {
    const token = localStorage.getItem('token');

    fetch(`https://characters.efroai.net:3000/api/bots/${botId}/approve`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchBots(); // Refresh the bot list
    })
    .catch(error => console.error('Error approving bot:', error));
}

// Deny a bot
function denyBot(botId) {
    const token = localStorage.getItem('token');

    fetch(`https://characters.efroai.net:3000/api/bots/${botId}/deny`, {
        method: 'POST',
        headers: {
            'Authorization': token
        }
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
        fetchBots(); // Refresh the bot list
    })
    .catch(error => console.error('Error denying bot:', error));
}

// Call fetchBots when the page loads
document.addEventListener('DOMContentLoaded', fetchBots);
