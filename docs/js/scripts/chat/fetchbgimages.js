// Image cycling logic
let currentSlot = 1; // Starting from slot 1

// Function to fetch and set the image based on the current slot
function setImage(slot) {
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
document.getElementById('prevImageBtn').addEventListener('click', () => {
    // Decrement currentSlot and loop back to 10 if we are at slot 1
    currentSlot = currentSlot > 1 ? currentSlot - 1 : 10;
    setImage(currentSlot);
    console.log('Current Slot after Prev:', currentSlot); // Debugging step
});

// Handle "Next" button click
document.getElementById('nextImageBtn').addEventListener('click', () => {
    // Increment currentSlot and loop back to 1 if we are at slot 10
    currentSlot = currentSlot < 10 ? currentSlot + 1 : 1;
    setImage(currentSlot);
    console.log('Current Slot after Next:', currentSlot); // Debugging step
});

// Display slot 1 by default when the page loads
window.addEventListener('load', () => {
    setImage(1); // Show slot 1 by default
});
