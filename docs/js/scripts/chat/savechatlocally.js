let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage

// Function to save the current chat
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

// Function to update the displayed saved chats list
function updateSavedChatsList() {
    const savedChatsList = document.getElementById('saved-chats-list');
    savedChatsList.innerHTML = ''; // Clear the current list

    savedChats.forEach((chat, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = chat.name;

        // Create the load chat button
        listItem.onclick = () => loadChat(index); // Set up an event listener to load the selected chat
        
        // Create the delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = (e) => {
            e.stopPropagation(); // Prevent the click from triggering the load chat action
            deleteChat(index);
        };

        // Append both the load chat action and delete button to the list item
        listItem.appendChild(deleteButton);
        savedChatsList.appendChild(listItem);
    });
}

// Call this function initially to display saved chats on page load
updateSavedChatsList();

// Function to load a saved chat
function loadChat(index) {
    const selectedChat = savedChats[index];
    
    if (selectedChat) {
        messages = []; // Clear current messages array
        clearAllMessages();
        
        // Load the selected chat's messages
        selectedChat.messages.forEach(msg => {
            // Check the structure of the message before displaying
            if (msg.content && msg.content.length > 0 && msg.role) {
                const messageText = msg.content[0].text; // Get the message text
                const senderRole = msg.role; // Determine sender role
                displayMessage(messageText, senderRole, true, true); // Call displayMessage with correct parameters
            } else {
                console.warn(`Invalid message structure for chat: ${selectedChat.name}`, msg);
            }
        });

        alert(`Loaded chat: ${selectedChat.name}`);
    } else {
        alert('No chat found at this index.');
    }
}

// Function to delete a saved chat
function deleteChat(index) {
    if (confirm('Are you sure you want to delete this chat?')) {
        savedChats.splice(index, 1); // Remove the chat from the savedChats array
        localStorage.setItem('savedChats', JSON.stringify(savedChats)); // Update local storage
        updateSavedChatsList(); // Refresh the saved chats list
        alert('Chat deleted successfully!');
    }
}

// Add event listener to the save chat button
document.getElementById('save-chat-button').addEventListener('click', saveChat);
