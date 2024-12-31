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

let currentSlot = 1; // Starting from slot 1
let validSlots = []; // To store valid slots

// Function to check if a slot is valid by fetching it
async function checkSlotValidity(slot) {
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    const url = `https://efroai.net/bucket/${userId}/${charId}/slot${slot}.webp`;

    try {
        const response = await fetch(url, { method: 'HEAD' }); // Use HEAD request to check existence
        if (response.ok) {
            return true; // Slot is valid
        } else {
            return false; // Slot is invalid (404 or other error)
        }
    } catch (error) {
        console.error("Error checking slot:", error);
        return false; // Assume invalid if there's an error
    }
}

// Function to fetch and set the image based on the current slot
async function setImage(slot) {
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;
    const url = `https://efroai.net/bucket/${userId}/${charId}/slot${slot}.webp`; // Example slot-based image URL

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

    // Add click event listeners to cycle the image slots when clicked
    const cycleImages = document.querySelectorAll('.cycle-image');
    cycleImages.forEach((img) => {
        img.addEventListener('click', () => {
            if (img.closest('#left-image-container')) {
                // If the left image was clicked, cycle left
                currentSlot = getNextSlot('prev');
            } else if (img.closest('#right-image-container')) {
                // If the right image was clicked, cycle right
                currentSlot = getNextSlot('next');
            }
            setImage(currentSlot);
        });
    });
}

// Function to get the next valid slot (or previous)
async function getNextSlot(direction) {
    let newSlot = currentSlot;
    if (direction === 'next') {
        do {
            newSlot = newSlot === validSlots[validSlots.length - 1] ? validSlots[0] : validSlots[validSlots.indexOf(newSlot) + 1];
        } while (!validSlots.includes(newSlot)); // Loop until valid slot found
    } else if (direction === 'prev') {
        do {
            newSlot = newSlot === validSlots[0] ? validSlots[validSlots.length - 1] : validSlots[validSlots.indexOf(newSlot) - 1];
        } while (!validSlots.includes(newSlot)); // Loop until valid slot found
    }
    return newSlot;
}

// Function to initialize the valid slots and update the available ones
async function initializeSlots() {
    validSlots = []; // Reset valid slots array
    const maxSlots = 10; // Assuming max slots are 10

    // Check which slots are valid (not 404)
    for (let slot = 1; slot <= maxSlots; slot++) {
        const isValid = await checkSlotValidity(slot);
        if (isValid) {
            validSlots.push(slot);
        }
    }

    // Display the first valid slot
    if (validSlots.length > 0) {
        currentSlot = validSlots[0]; // Start with the first valid slot
        setImage(currentSlot);
    } else {
        console.warn("No valid slots available.");
    }
}

// Initialize valid slots on page load
window.addEventListener('load', () => {
    initializeSlots(); // Initialize and set the first valid image
});

// Handle "Previous" button click
document.getElementById('prevImageBtn').addEventListener('click', () => {
    currentSlot = getNextSlot('prev');
    setImage(currentSlot);
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', () => {
    currentSlot = getNextSlot('next');
    setImage(currentSlot);
});

