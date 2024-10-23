let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage
let selectedChatIndex = null; // To store the index of the chat to be deleted

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

        // Set up an event listener for loading the selected chat
        listItem.onclick = () => loadChat(index);

        // Enable right-click context menu
        listItem.oncontextmenu = (e) => {
            e.preventDefault(); // Prevent default context menu
            selectedChatIndex = index; // Set the selected chat index
            showContextMenu(e.pageX, e.pageY); // Show custom context menu
        };

        savedChatsList.appendChild(listItem);
    });
}

// Function to show context menu
function showContextMenu(x, y) {
    const contextMenu = document.getElementById('context-menu');
    contextMenu.style.display = 'block';
    contextMenu.style.left = `${x}px`;
    contextMenu.style.top = `${y}px`;
}

// Function to hide context menu
function hideContextMenu() {
    document.getElementById('context-menu').style.display = 'none';
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
function deleteChat() {
    if (confirm('Are you sure you want to delete this chat?')) {
        savedChats.splice(selectedChatIndex, 1); // Remove the chat from the savedChats array
        localStorage.setItem('savedChats', JSON.stringify(savedChats)); // Update local storage
        updateSavedChatsList(); // Refresh the saved chats list
        alert('Chat deleted successfully!');
    }
    hideContextMenu(); // Hide the context menu after action
}

// Attach delete action to the context menu button
document.getElementById('delete-chat-button').addEventListener('click', deleteChat);

// Hide context menu when clicking outside of it
window.addEventListener('click', hideContextMenu);

// Add event listener to the save chat button
document.getElementById('save-chat-button').addEventListener('click', saveChat);
