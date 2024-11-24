// Function to save chat messages to the bucket
async function saveChatMessages() {
    const characterName = getCharacterName(); // Function to get the character name from the current chat
    //const userID = getUserID(); // Get the user's ID (you need to implement getUserID)
    
    const chatData = {
        name: `${characterName}_${new Date().toISOString()}`, // Create a unique name with character's name and timestamp
        messages: [...messages],
        timestamp: new Date().toISOString(),
        userID: userID
    };
    
    // Prepare chat data as JSON
    const chatJSON = JSON.stringify(chatData);
    const blob = new Blob([chatJSON], { type: 'application/json' });
    
    // Create FormData to send the file
    const formData = new FormData();
    formData.append('file', blob, `${chatData.name}.json`);
    formData.append('userId', userID); // Append user ID for identification
    
    try {
        // Send chat data to the server (make sure the backend URL is correct)
        const response = await fetch('https://bucket.efroai.net/upload-chat', {
            method: 'POST',
            body: formData
        });
        const result = await response.json();
        
        if (response.ok) {
            console.log('Chat saved successfully!');
        } else {
            console.error('Error saving chat: ' + result.error);
        }
    } catch (error) {
        console.error('An error occurred while saving the chat:', error);
    }
}

// // Function to get the user's ID (replace with actual logic to fetch the user ID)
// function getUserID() {
//     return localStorage.getItem('userID') || 'defaultUser'; // Use localStorage or sessionStorage, or fallback
// }

// Function to get the character's name (replace with actual logic to fetch the character's name)
function getCharacterName() {
    const character = localStorage.getItem('characterName') || 'unknownCharacter'; // Replace with actual logic
    return character;
}

// Listen for the beforeunload event to save chat messages when the user closes or navigates away from the page
window.addEventListener('beforeunload', async (event) => {
    // This will trigger when the page is about to be unloaded (closed or navigated away)
    await saveChatMessages(); // Save chat messages before the page is unloaded
});

