let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage
let messages = []; // Replace with your actual messages array

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

        listItem.oncontextmenu = (e) => {
            e.preventDefault(); // Prevent the default context menu
            showPopupMenu(e, index);
        };

        listItem.onclick = () => loadChat(index);
        savedChatsList.appendChild(listItem);
    });
}

function showPopupMenu(event, index) {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.innerHTML = ''; // Clear previous menu items

    const deleteOption = document.createElement('div');
    deleteOption.textContent = 'Delete Chat';
    deleteOption.onclick = (e) => {
        e.stopPropagation();
        deleteChat(index);
        popupMenu.style.display = 'none'; // Hide the menu after action
    };

    popupMenu.appendChild(deleteOption);
    popupMenu.style.display = 'block';
    popupMenu.style.left = `${event.pageX}px`;
    popupMenu.style.top = `${event.pageY}px`;
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
        messages = []; // Clear current messages array
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

// Call this function initially to display saved chats on page load
updateSavedChatsList();

// Hide the popup menu when clicking anywhere else
document.addEventListener('click', () => {
    const popupMenu = document.getElementById('popup-menu');
    popupMenu.style.display = 'none';
});
