let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage

// Function to save the current chat
async function saveChat() {
    const chatName = prompt("Enter a name for this chat:");
    if (chatName) {
        const chatData = { name: chatName, messages: [...messages] };

        try {
            // Send chat data to the backend to save it to S3
            const response = await fetch('https://bucket.efroai.net/save-chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: 'user123', chat: chatData }), // You can replace 'user123' with the actual user ID
            });

            const data = await response.json();
            if (response.ok) {
                alert('Chat saved successfully!');
                updateSavedChatsList();
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert(`Error saving chat: ${error.message}`);
        }
    } else {
        alert('Chat name is required.');
    }
}
// Function to update the list of saved chats
async function updateSavedChatsList() {
    const savedChatsList = document.getElementById('saved-chats-list');
    savedChatsList.innerHTML = '';

    try {
        // Fetch saved chats list from the backend (e.g., list files from S3)
        const response = await fetch('https://bucket.efroai.net/files/efai-savedchats');
        const chats = await response.json();

        chats.forEach((chat, index) => {
            const listItem = document.createElement('li');
            listItem.textContent = chat.Key;

            listItem.onclick = () => loadChat(chat.Key); // Load chat on left click

            listItem.oncontextmenu = (e) => {
                e.preventDefault();
                showPopupMenu(e, chat.Key);
            };

            savedChatsList.appendChild(listItem);

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '';
            deleteButton.className = 'delete-button'; 
            deleteButton.onclick = (e) => {
                e.stopPropagation();
                deleteChat(chat.Key);
            };
            listItem.appendChild(deleteButton);
        });
    } catch (error) {
        alert('Error fetching saved chats.');
    }
}

// Function to show the popup menu for deletion
function showPopupMenu(event, index) {
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
        deleteChat(index);
    };
    popupMenu.appendChild(deleteButton);

    // Create the Download button
    const downloadButton = document.createElement('button');
    downloadButton.textContent = 'Download';
    downloadButton.className = 'popup-download-button'; // Apply class for styling
    downloadButton.onclick = (e) => {
        e.stopPropagation();
        downloadChat(index);
    };
    popupMenu.appendChild(downloadButton);

    // Close the popup when clicking elsewhere
    document.addEventListener('click', closePopup);
}

// Function to download a chat as JSON
function downloadChat(index) {
    const chatData = savedChats[index];
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
        alert('Chat not found. Please ensure you entered the correct index.');
    }
}


// Function to close the popup menu
function closePopup() {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.style.display = 'none';
    document.removeEventListener('click', closePopup);
}

// Function to delete a chat
async function deleteChat(key) {
    if (confirm('Are you sure you want to delete this chat?')) {
        try {
            const response = await fetch(`/delete-chat/${key}`, { method: 'DELETE' });
            const data = await response.json();
            if (response.ok) {
                updateSavedChatsList();
                alert('Chat deleted successfully!');
            } else {
                alert(`Error: ${data.error}`);
            }
        } catch (error) {
            alert(`Error deleting chat: ${error.message}`);
        }
    }
}

// Function to load a selected chat
async function loadChat(key) {
    try {
        const response = await fetch(`https://bucket.efroai.net/file-url/efai-savedchats/${key}`);
        const { url } = await response.json();

        const chatResponse = await fetch(url);
        const chatData = await chatResponse.json();

        messages = [];
        clearAllMessages();

        chatData.messages.forEach(msg => {
            if (msg.content && msg.content.length > 0 && msg.role) {
                const messageText = msg.content[0].text;
                const senderRole = msg.role;
                displayMessage(messageText, senderRole, true, true);
            }
        });

        alert(`Loaded chat: ${chatData.name}`);
    } catch (error) {
        alert('Error loading chat.');
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
