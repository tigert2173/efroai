let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage

// Function to save the current chat
function saveChat() {
    const chatName = prompt("Enter a name for this chat:");
    if (chatName) {
        if (savedChats.some(chat => chat.name === chatName)) {
            alert('A chat with this name already exists. Please choose a different name.');
            return;
        }

        const chatData = { name: chatName, messages: [...messages] };
        savedChats.push(chatData);
        localStorage.setItem('savedChats', JSON.stringify(savedChats));
        updateSavedChatsList();
        alert('Chat saved successfully!');
    } else {
        alert('Chat name is required.');
    }
}

// Function to update the list of saved chats
function updateSavedChatsList() {
    const savedChatsList = document.getElementById('saved-chats-list');
    savedChatsList.innerHTML = '';

    savedChats.forEach((chat, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = chat.name;

        listItem.onclick = () => loadChat(index); // Load chat on left click

        // Right-click context menu
        listItem.oncontextmenu = (e) => {
            e.preventDefault();
            showPopupMenu(e, index);
        };

        savedChatsList.appendChild(listItem);
    });
}

// Function to show the popup menu for deletion
function showPopupMenu(event, index) {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.style.display = 'block';
    popupMenu.style.left = `${event.pageX}px`;
    popupMenu.style.top = `${event.pageY}px`;

    // Clear previous items
    popupMenu.innerHTML = '';

    // Create delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        deleteChat(index);
    };
    popupMenu.appendChild(deleteButton);

    // Close the popup when clicking elsewhere
    document.addEventListener('click', closePopup);
}

// Function to close the popup menu
function closePopup() {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.style.display = 'none';
    document.removeEventListener('click', closePopup);
}

// Function to delete a chat
function deleteChat(index) {
    if (confirm('Are you sure you want to delete this chat?')) {
        savedChats.splice(index, 1);
        localStorage.setItem('savedChats', JSON.stringify(savedChats));
        updateSavedChatsList();
        alert('Chat deleted successfully!');
        closePopup(); // Close the popup after deletion
    }
}

// Function to load a selected chat
function loadChat(index) {
    const selectedChat = savedChats[index];
    if (selectedChat) {
        messages = []; // Clear current messages array
        clearAllMessages();

        selectedChat.messages.forEach(msg => {
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

// Function to download a chat as JSON
function downloadChatAsJSON() {
    const chatName = prompt("Enter the name of the chat you want to download:");
    const chatData = savedChats.find(chat => chat.name === chatName);

    if (chatData) {
        const jsonString = JSON.stringify(chatData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chatData.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Chat downloaded successfully!');
    } else {
        alert('Chat not found. Please ensure you entered the correct name.');
    }
}

// Function to upload a chat from a JSON file
function uploadChat(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const uploadedChat = JSON.parse(e.target.result);
                if (uploadedChat.name && Array.isArray(uploadedChat.messages)) {
                    savedChats.push(uploadedChat);
                    localStorage.setItem('savedChats', JSON.stringify(savedChats));
                    updateSavedChatsList();
                    alert('Chat uploaded successfully!');
                } else {
                    alert('Invalid chat structure. Ensure it has a name and messages.');
                }
            } catch (error) {
                alert('Error parsing JSON file. Please ensure it is a valid JSON.');
            }
        };
        reader.readAsText(file);
    } else {
        alert('No file selected. Please choose a JSON file to upload.');
    }
}

// Event listeners for buttons
document.getElementById('save-button').onclick = saveChat;
document.getElementById('download-button').onclick = downloadChatAsJSON;
document.getElementById('upload-button').onclick = () => document.getElementById('upload-input').click();
document.getElementById('upload-input').onchange = uploadChat;

// Call this function initially to display saved chats on page load
updateSavedChatsList();
