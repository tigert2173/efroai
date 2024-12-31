// Handle form submission to fetch and set the background or side image
document.getElementById('fetchImageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const userId = sessionStorage.getItem('characterUploader'); // Dynamic user ID from character data
    const charId = sessionStorage.getItem('selectedCharacterId'); // Dynamic character ID from character data
    const objectKey = document.getElementById('objectKey').value.trim();

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

// Initialize slot to track which image is being shown
let currentSlot = 1;  // Default slot
let currentSlotRight = 1; // Right side image slot

// Function to fetch and set the image based on the current slot
function setImage(slot, position) {
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    const imagePosition = position;  // Position passed in the function (left, right, or background)

    const url = `https://efroai.net/bucket/${userId}/${charId}/slot${slot}.webp`;  // Image URL based on slot

    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');
    const chatWrapper = document.getElementById('chat-wrapper');

    if (imagePosition === 'background') {
        document.getElementById('chat-container').style.backgroundImage = `url('${url}')`;
    } else if (imagePosition === 'left') {
        leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;">`;
        chatWrapper.classList.add('has-left-image');
    } else if (imagePosition === 'right') {
        rightImageContainer.innerHTML = `<img src="${url}" alt="Right Image" style="width: 100%; height: auto;">`;
        chatWrapper.classList.add('has-right-image');
    }
}

// Navigation buttons for left side image
document.getElementById('prevImageBtn').addEventListener('click', () => {
    if (currentSlot > 1) {
        currentSlot--;
    } else {
        currentSlot = 10; // Loop back to slot 10
    }
    setImage(currentSlot, 'left');
});

document.getElementById('nextImageBtn').addEventListener('click', () => {
    if (currentSlot < 10) {
        currentSlot++;
    } else {
        currentSlot = 1; // Loop back to slot 1
    }
    setImage(currentSlot, 'left');
});

// Navigation buttons for right side image
document.getElementById('prevImageBtnRight').addEventListener('click', () => {
    if (currentSlotRight > 1) {
        currentSlotRight--;
    } else {
        currentSlotRight = 10; // Loop back to slot 10
    }
    setImage(currentSlotRight, 'right');
});

document.getElementById('nextImageBtnRight').addEventListener('click', () => {
    if (currentSlotRight < 10) {
        currentSlotRight++;
    } else {
        currentSlotRight = 1; // Loop back to slot 1
    }
    setImage(currentSlotRight, 'right');
});

// Display the first image by default when the page loads
window.addEventListener('load', () => {
    setImage(1, 'left'); // Show left slot 1 by default
    setImage(1, 'right'); // Show right slot 1 by default
});
