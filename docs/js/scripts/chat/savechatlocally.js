let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage

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

function updateSavedChatsList() {
    const savedChatsList = document.getElementById('saved-chats-list');
    savedChatsList.innerHTML = '';

    savedChats.forEach((chat, index) => {
        const listItem = document.createElement('li');
        listItem.textContent = chat.name;
        listItem.onclick = () => loadChat(index); // Load chat on click

        // Right-click context menu
        listItem.oncontextmenu = (e) => {
            e.preventDefault();
            showPopupMenu(e.pageX, e.pageY, index);
        };

        savedChatsList.appendChild(listItem);
    });
}

function showPopupMenu(x, y, index) {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.innerHTML = ''; // Clear previous items

    const deleteItem = document.createElement('div');
    deleteItem.textContent = 'Delete Chat';
    deleteItem.onclick = () => {
        deleteChat(index);
        popupMenu.style.display = 'none'; // Hide menu after action
    };
    
    popupMenu.appendChild(deleteItem);
    popupMenu.style.left = `${x}px`;
    popupMenu.style.top = `${y}px`;
    popupMenu.style.display = 'block';
}

function hidePopupMenu() {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.style.display = 'none';
}

function deleteChat(index) {
    if (confirm('Are you sure you want to delete this chat?')) {
        savedChats.splice(index, 1);
        localStorage.setItem('savedChats', JSON.stringify(savedChats));
        updateSavedChatsList();
        alert('Chat deleted successfully!');
    }
}

function loadChat(index) {
    const selectedChat = savedChats[index];
    if (selectedChat) {
        messages = [];
        clearAllMessages();

        selectedChat.messages.forEach(msg => {
            if (msg.content && msg.content.length > 0 && msg.role) {
                const messageText = msg.content[0].text;
                const senderRole = msg.role;
                displayMessage(messageText, senderRole, true, true);
            } else {
                console.warn(`Invalid message structure for chat: ${selectedChat.name}`, msg);
            }
        });

        alert(`Loaded chat: ${selectedChat.name}`);
    } else {
        alert('No chat found at this index.');
    }
}

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

// Hide the popup menu when clicking outside of it
document.addEventListener('click', hidePopupMenu);

// Call this function initially to display saved chats on page load
updateSavedChatsList();
