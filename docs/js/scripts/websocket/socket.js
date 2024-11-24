const socket = new WebSocket('wss://efroai.net'); // Update with your domain

// Connection opened
socket.addEventListener('open', (event) => {
    console.log('Connected to WebSocket server');
});

// Listen for messages
socket.addEventListener('message', (event) => {
    console.log('Message from server:', event.data);
    // Handle ping or any other messages from the server
    if (event.data === 'ping') {
        // You can respond to pings if needed
        socket.send('pong'); // Example response
    }
});

// Connection closed
socket.addEventListener('close', (event) => {
    console.log('Disconnected from WebSocket server');
});
