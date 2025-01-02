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
           // chatWrapper.style.setProperty('--background-image', `url('${url}')`);
           chatContainer.style.setProperty('--chatContainer-bg-opacity', 0);
           chatWrapper.style.backgroundImage = `url('${url}')`;

        } else if (imagePosition === 'left') {
            // Set the left side image
            chatContainer.style.setProperty('--chatContainer-bg-opacity', 1);

            chatWrapper.style.backgroundImage = 'none';
            leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;">`;
            chatWrapper.classList.add('has-left-image');
            inputWrapper.classList.add('has-left-image');
        } else if (imagePosition === 'right') {
            // Set the right side image
            chatContainer.style.setProperty('--chatContainer-bg-opacity', 1);

            chatWrapper.style.backgroundImage = 'none';
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

    // Select the chat background element and any other image containers
    const chatContainer = document.getElementById('chat-container');
    const leftImageContainer = document.getElementById('left-image-container');
    const rightImageContainer = document.getElementById('right-image-container');
    const messageElements = document.querySelectorAll('.message');

    // Optionally update opacity for side images if needed
    leftImageContainer.style.opacity = opacityValue;
    rightImageContainer.style.opacity = opacityValue;

    messageElements.forEach(message => {
        message.style.setProperty('--text-shadow', opacityValue);
    });
});

// Handle text outline slider
document.getElementById('opacity-slider-outline').addEventListener('input', (e) => {
    const lineWidth = e.target.value;
    
    const messageElements = document.querySelectorAll('.message');

    messageElements.forEach(message => {
        message.style.setProperty('--text-outline', lineWidth);
    });
});


// Handle opacity slider
document.getElementById('opacity-slider-messages').addEventListener('input', (e) => {
    const opacityValue = e.target.value / 100; // Convert the slider value to a fraction (0-1)
    
    // Get all message elements
    const messageElements = document.querySelectorAll('.message');
    
    // Apply the opacity to the background using the custom property
    messageElements.forEach(message => {
        // Update the custom property for background opacity
        message.style.setProperty('--bg-opacity', opacityValue);
    });
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
        // chatWrapper.style.setProperty('--background-image', `url('${url}')`);
        // chatWrapper.style.setProperty('--bg-opacity', 1);
        chatContainer.style.setProperty('--chatContainer-bg-opacity', 0);
        chatWrapper.style.backgroundImage = `url('${url}')`;
    } else if (imagePosition === 'left') {
        chatWrapper.style.backgroundImage = 'none';
        chatContainer.style.setProperty('--chatContainer-bg-opacity', 1);

        leftImageContainer.innerHTML = `<img src="${url}" alt="Left Image" style="width: 100%; height: auto;" class="image-slot" data-slot="${slot}">`;
        chatWrapper.classList.add('has-left-image');
        inputWrapper.classList.add('has-left-image');
    } else if (imagePosition === 'right') {
        chatWrapper.style.backgroundImage = 'none';
        chatContainer.style.setProperty('--chatContainer-bg-opacity', 1);

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
    const clickedImage = event.target.closest('.image-slot');
    const settingschanged = event.target.closest('.menu-container');


    // Check if the clicked element is an image with the "image-slot" class
    if (clickedImage && clickedImage.classList.contains('image-slot')) {
        let direction = event.clientX < window.innerWidth / 2 ? 'prev' : 'next'; // Determine the direction based on click position
        let slot = parseInt(clickedImage.getAttribute('data-slot')); // Get the slot number from clicked image
        
        // If SFW mode is on, restrict the slot range to 1-3
        if (isSFWModeEnabled()) {
            if (direction === 'prev') {
                slot = slot > 1 ? slot - 1 : 3; // Loop back to slot 3 if we're in SFW mode
            } else {
                slot = slot < 3 ? slot + 1 : 1; // Loop back to slot 1 if we're in SFW mode
            }
        } else {
            // Otherwise, continue with the normal slot behavior
            if (direction === 'prev') {
                slot = slot > 1 ? slot - 1 : 10; // Loop back to slot 10
            } else {
                slot = slot < 10 ? slot + 1 : 1; // Loop back to slot 1
            }
        }

        // Skip unavailable slots
        (async function skipInvalidSlots() {
            let validSlotFound = false;
            let currentCheckedSlot = slot; // Start checking from the clicked slot
            
            while (!validSlotFound) {
                // Check if the clicked slot is available and valid
                if (!unavailableSlots.has(currentCheckedSlot)) {
                    const isValid = await isImageValid(`https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentCheckedSlot}.webp`);
                    if (isValid) {
                        validSlotFound = true; // A valid slot was found, break the loop
                    } else {
                        // Mark it as unavailable and skip to the next slot
                        unavailableSlots.add(currentCheckedSlot);
                        currentCheckedSlot = direction === 'prev' 
                            ? currentCheckedSlot > 1 ? currentCheckedSlot - 1 : (isSFWModeEnabled() ? 3 : 10)
                            : currentCheckedSlot < (isSFWModeEnabled() ? 3 : 10) ? currentCheckedSlot + 1 : 1;
                    }
                } else {
                    // Skip unavailable slots if already marked
                    currentCheckedSlot = direction === 'prev'
                        ? currentCheckedSlot > 1 ? currentCheckedSlot - 1 : (isSFWModeEnabled() ? 3 : 10)
                        : currentCheckedSlot < (isSFWModeEnabled() ? 3 : 10) ? currentCheckedSlot + 1 : 1;
                }
            }

            setImage(currentCheckedSlot); // Update the image after finding a valid slot
        })();
        
    }

    if (settingschanged) {
        let attempts = 0;
        do {
            currentSlot = currentSlot <= (isSFW ? 3 : 10) ? currentSlot : (isSFW ? 1 : 1); // Default to slot 1 or 3 for SFW
            attempts++;
        } while (unavailableSlots.has(currentSlot) && attempts < 10); // Skip unavailable slots
    
        setImage(currentSlot);

    }

});



// Function to check if SFW mode is enabled
function isSFWModeEnabled() {
    // Assuming there's a toggle or flag that indicates if SFW mode is active
    const sfwToggle = document.getElementById('sfwToggle'); // Example: toggle switch in the DOM
    return sfwToggle && sfwToggle.checked; // Return true if SFW mode is enabled
}