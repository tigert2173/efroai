// Handle form submission to fetch and set the background or side image
document.getElementById('fetchImageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = sessionStorage.getItem('characterUploader'); // Dynamic user ID from character data
    const charId = sessionStorage.getItem('selectedCharacterId'); // Dynamic character ID from character data
    const objectKey = "slot1.webp"; //document.getElementById('objectKey').value.trim();

    if (!objectKey) {
        alert('Please enter both bucket name and object key.');
        return;
    }

    const chatContainer = document.getElementById('chat-container');
    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');
    const chatWrapper = document.getElementById('chat-wrapper');
    const inputWrapper = document.getElementById('input-wrapper');

    console.log("Uploader:", userId);
    console.log("Character ID:", charId);

    try {
        // Construct direct link to the image
        const url = `https://efroai.net/bucket/${userId}/${charId}/${encodeURIComponent(objectKey)}`;

        // Get the selected image position (background, left, right)
        const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;

        // Clear side images and reset chat wrapper class before applying the new image
        leftImageContainer.innerHTML = '';
        rightImageContainer.innerHTML = '';
        chatWrapper.classList.remove('has-left-image', 'has-right-image');
        inputWrapper.classList.remove('has-left-image', 'has-right-image');

        if (imagePosition === 'background') {
            // Set the background image
            chatContainer.style.setProperty('--background-image', `url('${url}')`);
            chatContainer.style.setProperty('--bg-opacity', 1);
        } else if (imagePosition === 'left') {
            // Set the left side image
            chatContainer.style.setProperty('--background-image', 'none');
            leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;">`;
            chatWrapper.classList.add('has-left-image');
            inputWrapper.classList.add('has-left-image');
        } else if (imagePosition === 'right') {
            // Set the right side image
            chatContainer.style.setProperty('--background-image', 'none');
            rightImageContainer.innerHTML = `<img src="${url}" alt="Right Image" style="width: 100%; height: auto;">`;
            chatWrapper.classList.add('has-right-image');
            inputWrapper.classList.add('has-right-image');
        }
    } catch (error) {
        console.error("Error setting image:", error);
        alert('Failed to set image: ' + error.message);
    }
});

// Handle opacity slider
document.getElementById('opacity-slider').addEventListener('input', (e) => {
    const opacityValue = e.target.value / 100;
    const chatContainer = document.getElementById('chat-container');
    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');

    // Update the opacity for background or side images
    chatContainer.style.setProperty('--bg-opacity', opacityValue);
    leftImageContainer.style.opacity = opacityValue;
    rightImageContainer.style.opacity = opacityValue;
});

// Toggle menu visibility
const toggleMenuBtn = document.getElementById("toggleMenuBtn");
const imageMenu = document.getElementById("imageMenu");

toggleMenuBtn.addEventListener("click", () => {
    imageMenu.classList.toggle("show-menu");
});

// Image cycling logic
let currentSlot = 1; // Starting from slot 1

// Utility function to check if an image URL is valid
async function isImageAvailable(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        return response.ok; // True if the status is 200-299
    } catch {
        return false;
    }
}

// Function to fetch and set the image based on the current slot
async function setImage(slot) {
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;
    const url = `https://efroai.net/bucket/${userId}/${charId}/slot${slot}.webp`;

    const chatContainer = document.getElementById('chat-container');
    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');
    const chatWrapper = document.getElementById('chat-wrapper');
    const inputWrapper = document.getElementById('input-wrapper');

    // Check if the image exists
    if (!(await isImageAvailable(url))) {
        console.warn(`Image for slot ${slot} not found.`);
        return false; // Skip this slot
    }

    // Clear side images before applying the new image
    leftImageContainer.innerHTML = '';
    rightImageContainer.innerHTML = '';
    chatWrapper.classList.remove('has-left-image', 'has-right-image');
    inputWrapper.classList.remove('has-left-image', 'has-right-image');

    // Apply the image based on the selected position
    if (imagePosition === 'background') {
        chatContainer.style.setProperty('--background-image', `url('${url}')`);
        chatContainer.style.setProperty('--bg-opacity', 1);
    } else if (imagePosition === 'left') {
        leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;">`;
        chatWrapper.classList.add('has-left-image');
        inputWrapper.classList.add('has-left-image');
    } else if (imagePosition === 'right') {
        rightImageContainer.innerHTML = `<img src="${url}" alt="Right Image" style="width: 100%; height: auto;">`;
        chatWrapper.classList.add('has-right-image');
        inputWrapper.classList.add('has-right-image');
    }
    return true; // Image set successfully
}

// Function to cycle through slots
async function cycleImage(direction) {
    const maxSlots = 10; // Total number of slots
    let attempts = maxSlots;

    while (attempts > 0) {
        currentSlot = direction === 'next' ? (currentSlot % maxSlots) + 1 : (currentSlot - 2 + maxSlots) % maxSlots + 1;
        if (await setImage(currentSlot)) {
            break; // Stop cycling if a valid image is found
        }
        attempts--;
    }
}

// Handle "Previous" and "Next" clicks
document.getElementById('prevImageBtn').addEventListener('click', () => cycleImage('prev'));
document.getElementById('nextImageBtn').addEventListener('click', () => cycleImage('next'));

// Add click listeners for the left and right containers
document.getElementById('left-image-container').addEventListener('click', () => cycleImage('prev'));
document.getElementById('right-image-container').addEventListener('click', () => cycleImage('next'));

// Display slot 1 by default when the page loads
window.addEventListener('load', () => {
    setImage(1); // Show slot 1 by default
});
