// Function to save chat messages to the backend
async function saveChatToBackend(username, characterName, messages) {
    const timestamp = new Date().toISOString();
    const chatData = {
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
        console.log('Chat saved successfully', data);
    } else {
        console.error('Failed to save chat', data.error);
    }
}

    // Event listener for the "Save Chat" button
    document.getElementById('save-chat-button').addEventListener('click', () => {
        const username = "user123"; // Example user, replace with actual username
        const characterName = "CharacterX"; // Replace with actual character name being chatted with

        if (messages && messages.length > 0) {
            saveChatToBackend(username, characterName, messages);
        }
    });