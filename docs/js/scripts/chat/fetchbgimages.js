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

// Set the initial slot to 1
let currentSlot = 1; // Starting from slot 1
const totalSlots = 10; // Total number of slots (adjust as needed)

// Function to fetch and set the image based on the current slot
async function setImage(slot) {
    const userId = sessionStorage.getItem('characterUploader');
    const charId = sessionStorage.getItem('selectedCharacterId');
    const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;
    const url = `https://efroai.net/bucket/${userId}/${charId}/slot${slot}.webp`; // Slot-based image URL

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

    try {
        // Fetch the image to check for 404 error
        const response = await fetch(url, { method: 'HEAD' });
        
        if (response.ok) {
            // If the image exists, set the image as usual
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
        } else {
            // If the image doesn't exist (404), skip to the next valid slot
            console.log(`Slot ${slot} does not exist, skipping.`);
            cycleImage();
        }
    } catch (error) {
        console.error("Error fetching image:", error);
        alert('Failed to fetch image: ' + error.message);
    }
}

// Handle "Previous" button click
document.getElementById('prevImageBtn').addEventListener('click', () => {
    if (currentSlot > 1) {
        currentSlot--;
    } else {
        currentSlot = totalSlots; // Loop back to the last slot
    }
    setImage(currentSlot);
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', () => {
    if (currentSlot < totalSlots) {
        currentSlot++;
    } else {
        currentSlot = 1; // Loop back to slot 1
    }
    setImage(currentSlot);
});

// Handle click on image to cycle through slots
document.getElementById('image-container').addEventListener('click', () => {
    cycleImage();
});

// Function to cycle to the next available image slot
async function cycleImage() {
    let slotChecked = false;

    // Loop through slots to find the next one that returns a valid image (no 404)
    let startSlot = currentSlot;
    do {
        // Increment slot and wrap around if necessary
        currentSlot = (currentSlot % totalSlots) + 1;
        
        // Skip to next slot if 404
        const url = `https://efroai.net/bucket/${sessionStorage.getItem('characterUploader')}/${sessionStorage.getItem('selectedCharacterId')}/slot${currentSlot}.webp`;
        const response = await fetch(url, { method: 'HEAD' });

        if (response.ok) {
            slotChecked = true; // Found a valid image slot
        }
    } while (!slotChecked && currentSlot !== startSlot);

    setImage(currentSlot);
}

// Display slot 1 by default when the page loads
window.addEventListener('load', () => {
    setImage(1); // Show slot 1 by default
});
