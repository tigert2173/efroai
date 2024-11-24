// Function to save the current chat to the bucket
async function saveChat() {
    const chatName = prompt("Enter a name for this chat:");
    if (chatName) {
        const chatData = { name: chatName, messages: [...messages], timestamp: new Date().toISOString() };
        
        // Prepare chat data for uploading
        const chatJSON = JSON.stringify(chatData);
        const blob = new Blob([chatJSON], { type: 'application/json' });
        
        // Create a form data to send to the server
        const formData = new FormData();
        formData.append('file', blob, `${chatName}-${new Date().toISOString()}.json`);
        
        // Assuming userID is stored in a variable or session
        const userID = getUserID();  // Add function or logic to retrieve userID
        formData.append('userId', userID);
        
        try {
            // Send the data to the server
            const response = await fetch('https://bucket.efroai.net/upload-chat', {
                method: 'POST',
                body: formData,
            });
            const result = await response.json();
            if (response.ok) {
                alert('Chat saved successfully!');
                updateSavedChatsList(); // Refresh the chat list after saving
            } else {
                alert('Error saving chat: ' + result.error);
            }
        } catch (error) {
            alert('An error occurred while saving the chat.');
        }
    } else {
        alert('Chat name is required.');
    }
}


// Function to update the list of saved chats from the bucket
async function updateSavedChatsList() {
    const savedChatsList = document.getElementById('saved-chats-list');
    savedChatsList.innerHTML = '';

    try {
        // Fetch the list of saved chats from the server
        const response = await fetch('https://bucket.efroai.net/list-chats');
        const savedChats = await response.json();
        
        savedChats.forEach((chat, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = chat.name;

            listItem.onclick = () => loadChat(chat); // Load chat on click

            // Right-click context menu
            listItem.oncontextmenu = (e) => {
                e.preventDefault();
                showPopupMenu(e, chat);
            };

            savedChatsList.appendChild(listItem);

            // Create a delete button for each chat
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'delete-button'; // Apply class for styling
            deleteButton.onclick = (e) => {
                e.stopPropagation(); // Prevent loading chat on button click
                deleteChat(chat);
            };
            listItem.appendChild(deleteButton);
        });
    } catch (error) {
        alert('Error fetching chat list.');
    }
}

// Function to show the popup menu for deletion and download
function showPopupMenu(event, chat) {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.style.display = 'block';
    popupMenu.style.left = `${event.pageX}px`;
    popupMenu.style.top = `${event.pageY}px`;
    
    popupMenu.innerHTML = ''; // Clear previous items

    // Create the Delete button
    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'popup-delete-button'; // Apply class for styling
    deleteButton.onclick = (e) => {
        e.stopPropagation();
        deleteChat(chat);
    };
    popupMenu.appendChild(deleteButton);

    // Create the Download button
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.className = 'popup-download-button'; // Apply class for styling
    downloadButton.onclick = (e) => {
        e.stopPropagation();
        downloadChat(chat);
    };
    popupMenu.appendChild(downloadButton);

    // Close the popup when clicking elsewhere
    document.addEventListener('click', closePopup);
}

// Function to download a chat from the bucket as JSON
async function downloadChat(chat) {
    try {
        const response = await fetch(`https://bucket.efroai.net/download-chat?name=${chat.name}`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${chat.name}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert('Chat downloaded successfully!');
    } catch (error) {
        alert('Error downloading chat.');
    }
}

// Function to delete a chat from the bucket
async function deleteChat(chat) {
    if (confirm('Are you sure you want to delete this chat?')) {
        try {
            const response = await fetch(`https://bucket.efroai.net/delete-chat?name=${chat.name}`, {
                method: 'DELETE',
            });
            const result = await response.json();
            if (response.ok) {
                alert('Chat deleted successfully!');
                updateSavedChatsList(); // Refresh the chat list after deletion
            } else {
                alert('Error deleting chat: ' + result.error);
            }
        } catch (error) {
            alert('An error occurred while deleting the chat.');
        }
    }
}

// Function to load a selected chat from the bucket
async function loadChat(chat) {
    try {
        const response = await fetch(`https://bucket.efroai.net/download-chat?name=${chat.name}`);
        const chatData = await response.json();

        if (chatData && chatData.messages) {
            console.log('Loaded chat data:', chatData); // Debug log
            messages = []; // Clear current messages array
            clearAllMessages();

            chatData.messages.forEach(msg => {
                if (msg.content && msg.content.length > 0 && msg.role) {
                    const messageText = msg.content[0].text; // Get the message text
                    const senderRole = msg.role; // Determine sender role
                    displayMessage(messageText, senderRole, true, true); // Call displayMessage with correct parameters
                } else {
                    console.warn(`Invalid message structure for chat: ${chat.name}`, msg);
                }
            });

            alert(`Loaded chat: ${chat.name}`);
        } else {
            alert('Chat not found.');
        }
    } catch (error) {
        alert('Error loading chat.');
    }
}


// Function to close the popup menu
function closePopup() {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.style.display = 'none';
    document.removeEventListener('click', closePopup);
}

// Function to get userID (you need to implement this based on your app's logic)
function getUserID() {
    // Example: fetch from sessionStorage or localStorage, or pass it via your app's context
    return userID;
}
// Event listeners for buttons
document.getElementById('save-button').onclick = saveChat;
document.getElementById('upload-button').onclick = () => document.getElementById('upload-input').click();
document.getElementById('upload-input').onchange = uploadChat;

// Call this function initially to display saved chats on page load
updateSavedChatsList();
