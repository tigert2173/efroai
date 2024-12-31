  // Handle form submission to fetch and set the background or inline image
// Handle form submission to fetch and set the background or side image
document.getElementById('fetchImageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bucketName = document.getElementById('bucketName').value.trim();
    const objectKey = document.getElementById('objectKey').value.trim();
    const chatContainer = document.getElementById('chat-container');
    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');
    const chatWrapper = document.getElementById('chat-wrapper');
    const inputWrapper = document.getElementById('input-wrapper');

    if (!bucketName || !objectKey) {
        alert('Please enter both bucket name and object key.');
        return;
    }

    try {
        // Fetch the pre-signed URL for the image
        const response = await fetch(`https://efroai.net/bucket/list/file-url/${bucketName}/${encodeURIComponent(objectKey)}`);
        if (!response.ok) throw new Error('Error generating URL.');

        const { url } = await response.json();

        // Get the selected image position (background, left, right)
        const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;

        // Clear side images and reset chat wrapper class before applying new image
        leftImageContainer.innerHTML = '';
        rightImageContainer.innerHTML = '';
        chatWrapper.classList.remove('has-left-image', 'has-right-image');
        inputWrapper.classList.remove('has-left-image', 'has-right-image');

        if (imagePosition === 'background') {
            // Set the background image
            chatContainer.style.setProperty('--background-image', `url('${url}')`);
            chatContainer.style.setProperty('--bg-opacity', 1);
            // Ensure the chat container is centered by removing any shifts
            chatWrapper.classList.remove('has-left-image', 'has-right-image');
            inputWrapper.classList.remove('has-left-image', 'has-right-image');
        } else if (imagePosition === 'left') {
            // Set the left side image
            chatContainer.style.setProperty('--background-image', 'none');
            leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;">`;
            // Add class to shift chat container for left image
            chatWrapper.classList.add('has-left-image');
            inputWrapper.classList.add('has-left-image');
        } else if (imagePosition === 'right') {
            // Set the right side image
            chatContainer.style.setProperty('--background-image', 'none');
            rightImageContainer.innerHTML = `<img src="${url}" alt="Right Image" style="width: 100%; height: auto;">`;
            // Add class to shift chat container for right image
            chatWrapper.classList.add('has-right-image');
            inputWrapper.classList.add('has-right-image');
        }
    } catch (error) {
        console.error(error);
        alert('Failed to set image: ' + error.message);
    }
});


// Handle opacity slider
document.getElementById('opacity-slider').addEventListener('input', (e) => {
    const opacityValue = e.target.value;
    const chatContainer = document.getElementById('chat-container');
    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');

    // Update the opacity for background or side images
    chatContainer.style.setProperty('--bg-opacity', opacityValue / 100);
    leftImageContainer.style.opacity = opacityValue / 100;
    rightImageContainer.style.opacity = opacityValue / 100;
});

// Select the button and the menu container
const toggleMenuBtn = document.getElementById("toggleMenuBtn");
const imageMenu = document.getElementById("imageMenu");

// Toggle visibility of the menu when the button is clicked
toggleMenuBtn.addEventListener("click", () => {
    imageMenu.classList.toggle("show-menu");
});
