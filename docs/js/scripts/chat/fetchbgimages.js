// Handle form submission to fetch and set the background or side image
document.getElementById('fetchImageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Retrieve character data from local storage
    const characterData = JSON.parse(localStorage.getItem('editCharacter'));

    if (!characterData) {
        console.error("Character data not found in local storage.");
        alert("Character data not found. Please ensure a character is selected.");
        return;
    }

    const bucketName = document.getElementById('bucketName').value.trim();
    const userId = characterData.uploader; // Dynamic user ID from character data
    const charId = characterData.id; // Dynamic character ID from character data
    const objectKey = document.getElementById('objectKey').value.trim();

    if (!bucketName || !objectKey) {
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
