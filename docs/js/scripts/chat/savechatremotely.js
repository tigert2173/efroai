// Function to save chat messages to the backend and update existing session
async function saveChatToBackend(sessionId, username, characterName, messages) {
    const timestamp = new Date().toISOString();
    const chatData = {
        sessionId: sessionId, // Unique session ID
        userId: username,
        characterName: characterName,
        messages: messages,
        timestamp: timestamp,
    };

    const response = await fetch('https://bucket.efroai.net/upload-chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatData),
    });

    const data = await response.json();
    if (response.ok) {
        console.log('Chat saved/updated successfully', data);
    } else {
        console.error('Failed to save/update chat', data.error);
    }
}

// Initialize sessionId on page load or when the chat starts
let sessionId = localStorage.getItem('sessionId');
if (!sessionId) {
    // Generate a new sessionId (could be timestamp-based or random)
    sessionId = new Date().toISOString();
    localStorage.setItem('sessionId', sessionId); // Save to localStorage to persist across page reloads
}

// Function to handle new message (call this when a new message is added)
function handleNewMessage(message) {
    const username = sessionStorage.getItem('userID'); // Get the current user's ID
    const characterName = selectedCharacterId; // Replace with actual character name being chatted with

    // Update the message array with the new message
    messages.push(message);

    // Save or update the chat with the new message
    saveChatToBackend(sessionId, username, characterName, messages);
}

// Event listener for the "Save Chat" button (optional, for manual save)
document.getElementById('save-chat-button').addEventListener('click', () => {
    const username = "user123"; // Example user, replace with actual username
    const characterName = "CharacterX"; // Replace with actual character name being chatted with

    if (messages && messages.length > 0) {
        saveChatToBackend(sessionId, username, characterName, messages);
    }
});