let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage

function saveChat() {
    const chatName = prompt("Enter a name for this chat:");
    if (chatName) {
        // Check if the chat name already exists
        if (savedChats.some(chat => chat.name === chatName)) {
            alert('A chat with this name already exists. Please choose a different name.');
            return;
        }

        const chatData = { name: chatName, messages: [...messages] };
        savedChats.push(chatData);

        // Save to local storage
        localStorage.setItem('savedChats', JSON.stringify(savedChats));

        // Update saved chats list
        updateSavedChatsList();
        alert('Chat saved successfully!');
    } else {
        alert('Chat name is required.');
    }
}

function updateSavedChatsList() {
    const savedChatsList = document.getElementById('saved-chats-list');
    savedChatsList.innerHTML = ''; // Clear the current list

    savedChats.forEach((chat, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = chat.name;
        listItem.onclick = () => loadChat(index); // Set up an event listener to load the selected chat
        savedChatsList.appendChild(listItem);
    });
}

// Call this function initially to display saved chats on page load
updateSavedChatsList();

function loadChat(index) {
    const selectedChat = savedChats[index];
    if (selectedChat) {
        messages = []; // Clear current messages array

       // chatContainer.innerHTML = ''; // Clear current chat

        // Load the selected chat's messages
        selectedChat.messages.forEach(msg => {
            // Check the structure of the message before displaying
            if (msg.content && msg.content.length > 0 && msg.role) {
                const messageText = msg.content[0].text; // Get the message text
                const senderRole = msg.role; // Determine sender role
                displayMessage(messageText, senderRole, true); // Call displayMessage with correct parameters
            } else {
                console.warn(`Invalid message structure for chat: ${selectedChat.name}`, msg);
            }
        });

        alert(`Loaded chat: ${selectedChat.name}`);
    } else {
        alert('No chat found at this index.');
    }
}

// Export the necessary functions
