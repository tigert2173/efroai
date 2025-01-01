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
// Utility function to check if an image URL is valid (returns 200)
async function isImageValid(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' }); // Only fetch the headers
        return response.ok; // Return true if status is 200
    } catch {
        return false; // Return false if fetch fails
    }
}

// Function to fetch and set the image based on the current slot
async function setImage(slot) {
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;
    const url = `https://efroai.net/bucket/${userId}/${charId}/slot${slot}.webp`; // Slot-based image URL

    // Check if the image URL is valid
    const isValid = await isImageValid(url);
    if (!isValid) {
        console.log(`Image for slot ${slot} is not valid.`);
        return;
    }

    const chatContainer = document.getElementById('chat-container');
    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');
    const chatWrapper = document.getElementById('chat-wrapper');
    const inputWrapper = document.getElementById('input-wrapper');

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
}

// Handle "Previous" button click
document.getElementById('prevImageBtn').addEventListener('click', async () => {
    let attempts = 0;
    do {
        currentSlot = currentSlot > 1 ? currentSlot - 1 : 10; // Loop back to slot 10
        attempts++;
    } while (!(await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentSlot}.webp`)) && attempts < 10);

    setImage(currentSlot);
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', async () => {
    let attempts = 0;
    do {
        currentSlot = currentSlot < 10 ? currentSlot + 1 : 1; // Loop back to slot 1
        attempts++;
    } while (!(await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentSlot}.webp`)) && attempts < 10);

    setImage(currentSlot);
});

// Display slot 1 by default when the page loads
window.addEventListener('load', async () => {
    let attempts = 0;
    do {
        currentSlot = currentSlot <= 10 ? currentSlot : 1; // Default to slot 1
        attempts++;
    } while (!(await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentSlot}.webp`)) && attempts < 10);

    setImage(currentSlot);
});


// Handle "Previous" button click
document.getElementById('prevImageBtn').addEventListener('click', () => {
    if (currentSlot > 1) {
        currentSlot--;
    } else {
        currentSlot = 10; // Loop back to slot 10
    }
    setImage(currentSlot);
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', () => {
    if (currentSlot < 10) {
        currentSlot++;
    } else {
        currentSlot = 1; // Loop back to slot 1
    }
    setImage(currentSlot);
});

// Display slot 1 by default when the page loads
window.addEventListener('load', () => {
    setImage(1); // Show slot1 by default
});


