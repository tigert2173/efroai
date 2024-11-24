 // Save chat function
 async function saveChat() {
    const chatData = { name: 'Chat1', messages: [{ role: 'user', content: 'Hello!' }] };

    const response = await fetch('https://bucket.efroai.net/save-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, chat: chatData })
    });

    const data = await response.json();
    if (response.ok) {
        alert('Chat saved successfully!');
        updateSavedChatsList(); // Refresh the list
    } else {
        alert(`Error: ${data.error}`);
    }
}

// Update the list of saved chats
async function updateSavedChatsList() {
    savedChatsList.innerHTML = ''; // Clear current list

    const response = await fetch(`https://bucket.efroai.net/files/${userId}`);
    const chats = await response.json();

    chats.forEach((chat) => {
        const listItem = document.createElement('li');
        listItem.textContent = chat.name;

        // Create download button
        const downloadButton = document.createElement('button');
        downloadButton.textContent = 'Download';
        downloadButton.classList.add('download-button');
        downloadButton.onclick = () => downloadChat(chat.key);

        // Create delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.classList.add('delete-button');
        deleteButton.onclick = () => deleteChat(chat.key);

        listItem.appendChild(downloadButton);
        listItem.appendChild(deleteButton);

        savedChatsList.appendChild(listItem);
    });
}

// Delete chat function
async function deleteChat(key) {
    if (confirm('Are you sure you want to delete this chat?')) {
        const response = await fetch(`https://bucket.efroai.net/delete-chat/${key}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok) {
            updateSavedChatsList(); // Refresh the list after deletion
            alert('Chat deleted successfully!');
        } else {
            alert(`Error: ${data.error}`);
        }
    }
}

// Download chat function
async function downloadChat(key) {
    const response = await fetch(`https://bucket.efroai.net/file-url/${userId}/${key}`);
    const { url } = await response.json();

    const a = document.createElement('a');
    a.href = url;
    a.download = key;
    a.click();
}

// Set up event listener for save button
saveButton.onclick = saveChat;

// Initially load saved chats
updateSavedChatsList();