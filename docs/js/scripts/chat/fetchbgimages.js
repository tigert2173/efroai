// Handle form submission to fetch and set the background or side image
document.getElementById('fetchImageForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    do {
        currentSlot = currentSlot <= (isSFW ? 3 : 10) ? currentSlot : (isSFW ? 1 : 1); // Default to slot 1 or 3 for SFW
        attempts++;
    } while (unavailableSlots.has(currentSlot) && attempts < 10); // Skip unavailable slots

    setImage(currentSlot);
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

// SFW Toggle functionality
const sfwToggle = document.getElementById('sfwToggle');
let isSFW = sfwToggle.checked;

// Update SFW mode whenever the toggle is changed
sfwToggle.addEventListener('change', () => {
    isSFW = sfwToggle.checked;
    // Update the image slot display based on the SFW mode
    currentSlot = isSFW ? 1 : currentSlot; // Reset to slot 1 if SFW is enabled
    setImage(currentSlot); // Show the first valid image
});

// Image cycling logic
let currentSlot = 1; // Starting from slot 1

// Initialize a set to store unavailable slots for fast access
let unavailableSlots = new Set();

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
        unavailableSlots.add(slot); // Mark this slot as unavailable for future use
        return false;
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

    return true;
}


// Handle "Previous" button click
document.getElementById('prevImageBtn').addEventListener('click', async () => {
    let attempts = 0;
    do {
        currentSlot = currentSlot > 1 ? currentSlot - 1 : (isSFW ? 3 : 10); // Loop back to slot 3 if SFW is enabled
        attempts++;

        // Skip the current slot if it's unavailable (returns 404) and remember the unavailable slots
        while (unavailableSlots.has(currentSlot) || !(await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentSlot}.webp`))) {
            unavailableSlots.add(currentSlot); // Mark the slot as unavailable
            currentSlot = currentSlot > 1 ? currentSlot - 1 : (isSFW ? 3 : 10); // Continue looping back to the previous slot
            attempts++;
        }
    } while (attempts < 10 && unavailableSlots.has(currentSlot)); // Ensure we don't loop indefinitely

    setImage(currentSlot); // Update the image after finding a valid slot
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', async () => {
    let attempts = 0;
    do {
        currentSlot = currentSlot < (isSFW ? 3 : 10) ? currentSlot + 1 : 1; // Loop back to slot 1 if we're at the end

        // Skip the current slot if it's unavailable (returns 404) and remember the unavailable slots
        while (unavailableSlots.has(currentSlot) || !(await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentSlot}.webp`))) {
            unavailableSlots.add(currentSlot); // Mark the slot as unavailable
            currentSlot = currentSlot < (isSFW ? 3 : 10) ? currentSlot + 1 : 1; // Continue looping forward to the next slot
            attempts++;
        }
    } while (attempts < 10 && unavailableSlots.has(currentSlot)); // Ensure we don't loop indefinitely

    setImage(currentSlot); // Update the image after finding a valid slot
});

// Display slot 1 by default when the page loads
window.addEventListener('load', async () => {
    let attempts = 0;
    do {
        currentSlot = currentSlot <= (isSFW ? 3 : 10) ? currentSlot : (isSFW ? 1 : 1); // Default to slot 1 or 3 for SFW
        attempts++;
    } while (unavailableSlots.has(currentSlot) && attempts < 10); // Skip unavailable slots

    setImage(currentSlot);
});

// Add click listener to the image elements for navigation
document.addEventListener('click', (event) => {
    const clickedImage = event.target;

    // Check if the clicked element is an image with the "image-slot" class
    if (clickedImage && clickedImage.classList.contains('image-slot')) {
        const slot = clickedImage.getAttribute('data-slot'); // Get the slot number
        let direction = event.clientX < window.innerWidth / 2 ? 'prev' : 'next'; // Determine the direction based on click position

        // If SFW mode is on, restrict the slot range to 1-3
        if (isSFWModeEnabled()) {
            // Make sure the slots are within the allowed range for SFW mode
            if (direction === 'prev') {
                currentSlot = currentSlot > 1 ? currentSlot - 1 : 3; // Loop back to slot 3 if we're in SFW mode
            } else {
                currentSlot = currentSlot < 3 ? currentSlot + 1 : 1; // Loop back to slot 1 if we're in SFW mode
            }
        } else {
            // Otherwise, continue with the normal slot behavior
            if (direction === 'prev') {
                currentSlot = currentSlot > 1 ? currentSlot - 1 : 10; // Loop back to slot 10
            } else {
                currentSlot = currentSlot < 10 ? currentSlot + 1 : 1; // Loop back to slot 1
            }
        }

        // Skip unavailable slots
        (async function skipInvalidSlots() {
            let validSlotFound = false;
            while (!validSlotFound) {
                // Check if the clicked slot is available and valid
                if (!unavailableSlots.has(currentSlot)) {
                    const isValid = await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentSlot}.webp`);
                    if (isValid) {
                        validSlotFound = true; // A valid slot was found, break the loop
                    } else {
                        // Mark it as unavailable and skip to the next slot
                        unavailableSlots.add(currentSlot);
                        if (isSFWModeEnabled()) {
                            // Stay within 1-3 slots if SFW mode is on
                            currentSlot = currentSlot < 3 ? currentSlot + 1 : 1;
                        } else {
                            currentSlot = direction === 'prev' ? currentSlot > 1 ? currentSlot - 1 : 10 : currentSlot < 10 ? currentSlot + 1 : 1;
                        }
                    }
                } else {
                    // Skip unavailable slots if already marked
                    if (isSFWModeEnabled()) {
                        currentSlot = currentSlot < 3 ? currentSlot + 1 : 1; // Keep within 1-3 range for SFW mode
                    } else {
                        currentSlot = direction === 'prev' ? currentSlot > 1 ? currentSlot - 1 : 10 : currentSlot < 10 ? currentSlot + 1 : 1;
                    }
                }
            }

            setImage(currentSlot); // Update the image after finding a valid slot
        })();
    }
});


// Function to check if SFW mode is enabled
function isSFWModeEnabled() {
    // Assuming there's a toggle or flag that indicates if SFW mode is active
    const sfwToggle = document.getElementById('sfwToggle'); // Example: toggle switch in the DOM
    return sfwToggle && sfwToggle.checked; // Return true if SFW mode is enabled
}