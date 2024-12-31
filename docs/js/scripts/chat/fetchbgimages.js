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

// Image cycling logic
let currentSlot = 1; // Starting from slot 1

// Function to fetch and check if the image exists
async function checkImageExists(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok) {
            return true;  // Image exists
        } else {
            return false; // Image doesn't exist (404 or other errors)
        }
    } catch (error) {
        console.error("Error checking image:", error);
        return false;
    }
}

// Function to fetch and set the image based on the current slot
async function setImage(slot) {
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;
    const url = `https://efroai.net/bucket/${userId}/${charId}/slot${slot}.webp`; // Example slot-based image URL

    // Check if the image exists before proceeding
    const imageExists = await checkImageExists(url);
    if (!imageExists) {
        console.log(`Slot ${slot} does not exist. Skipping.`);
        return; // Skip if the image doesn't exist
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
        leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;" class="cycle-image">`;
        chatWrapper.classList.add('has-left-image');
        inputWrapper.classList.add('has-left-image');
    } else if (imagePosition === 'right') {
        rightImageContainer.innerHTML = `<img src="${url}" alt="Right Image" style="width: 100%; height: auto;" class="cycle-image">`;
        chatWrapper.classList.add('has-right-image');
        inputWrapper.classList.add('has-right-image');
    }
}

// Function to cycle through available slots only
async function cycleImages() {
    let availableSlots = [];
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');

    // Check for all slots (1 to 10)
    for (let i = 1; i <= 10; i++) {
        const url = `https://efroai.net/bucket/${userId}/${charId}/slot${i}.webp`;
        const imageExists = await checkImageExists(url);
        if (imageExists) {
            availableSlots.push(i); // Add available slot to the list
        }
    }

    if (availableSlots.length > 0) {
        // If there are available slots, set the first available slot as the default
        currentSlot = availableSlots[0];
        setImage(currentSlot); // Display the first available image
    }
}

// Handle "Previous" button click
document.getElementById('prevImageBtn').addEventListener('click', async () => {
    let availableSlots = await getAvailableSlots();
    const currentIndex = availableSlots.indexOf(currentSlot);
    if (currentIndex > 0) {
        currentSlot = availableSlots[currentIndex - 1]; // Go to the previous available slot
    } else {
        currentSlot = availableSlots[availableSlots.length - 1]; // Loop to the last available slot
    }
    setImage(currentSlot);
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', async () => {
    let availableSlots = await getAvailableSlots();
    const currentIndex = availableSlots.indexOf(currentSlot);
    if (currentIndex < availableSlots.length - 1) {
        currentSlot = availableSlots[currentIndex + 1]; // Go to the next available slot
    } else {
        currentSlot = availableSlots[0]; // Loop to the first available slot
    }
    setImage(currentSlot);
});

// Function to get all available slots for cycling
async function getAvailableSlots() {
    let availableSlots = [];
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    // Check for all slots (1 to 10)
    for (let i = 1; i <= 10; i++) {
        const url = `https://efroai.net/bucket/${userId}/${charId}/slot${i}.webp`;
        const imageExists = await checkImageExists(url);
        if (imageExists) {
            availableSlots.push(i); // Add available slot to the list
        }
    }
    return availableSlots;
}

// Display the first available slot when the page loads
window.addEventListener('load', async () => {
    await cycleImages(); // Load the first available image
});

