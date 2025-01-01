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
        return null; // Return null if image is not valid
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
        leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;" class="image-slot" data-slot="${slot}">`;
        chatWrapper.classList.add('has-left-image');
        inputWrapper.classList.add('has-left-image');
    } else if (imagePosition === 'right') {
        rightImageContainer.innerHTML = `<img src="${url}" alt="Right Image" style="width: 100%; height: auto;" class="image-slot" data-slot="${slot}">`;
        chatWrapper.classList.add('has-right-image');
        inputWrapper.classList.add('has-right-image');
    }

    return true; // Return true to indicate the image was successfully set
}

// Function to get the next valid slot
async function getNextValidSlot(currentSlot, direction) {
    let nextSlot = direction === 'next' ? currentSlot + 1 : currentSlot - 1;

    // Loop through until a valid image is found
    let attempts = 0;
    while (!(await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${nextSlot}.webp`)) && attempts < 10) {
        nextSlot = direction === 'next' ? (nextSlot % 10) + 1 : (nextSlot === 1 ? 10 : nextSlot - 1); // Loop from 1 to 10
        attempts++;
    }

    return nextSlot;
}

// Handle "Previous" button click
document.getElementById('prevImageBtn').addEventListener('click', async () => {
    currentSlot = await getNextValidSlot(currentSlot, 'prev');
    setImage(currentSlot);
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', async () => {
    currentSlot = await getNextValidSlot(currentSlot, 'next');
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

// Add click listener to the image elements for navigation
document.addEventListener('click', async (event) => {
    const clickedImage = event.target;

    // Check if the clicked element is an image with the "image-slot" class
    if (clickedImage && clickedImage.classList.contains('image-slot')) {
        const slot = clickedImage.getAttribute('data-slot'); // Get the slot number
        const direction = event.clientX < window.innerWidth / 2 ? 'prev' : 'next'; // Determine the direction based on click position

        // Determine the next valid slot based on direction
        currentSlot = await getNextValidSlot(slot, direction);

        // Update the image after determining the new slot
        setImage(currentSlot);
    }
});

