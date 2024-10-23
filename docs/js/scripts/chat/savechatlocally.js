const { displayMessage } = require('/js/chat.js');

let savedChats = JSON.parse(localStorage.getItem('savedChats')) || []; // Load saved chats from localStorage

function saveChat() {
    const chatName = prompt("Enter a name for this chat:");
    if (chatName) {
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
        messages = selectedChat.messages; // Replace current messages array with the saved one

        // Clear the chat container and display the saved messages
        const chatContainer = document.getElementById('chat-container');
        chatContainer.innerHTML = ''; // Clear current chat

        // Display each message from the saved chat
        messages.forEach(msg => {
            displayMessage(msg.content[0].text, msg.role === 'assistant' ? 'bot' : msg.role, true);
            displayMessage('No previous user message found to regenerate.', 'bot');

        });

        alert(`Loaded chat: ${selectedChat.name}`);
    }
}

// Export the necessary functions
//module.exports = { saveChat, updateSavedChatsList, loadChat };
