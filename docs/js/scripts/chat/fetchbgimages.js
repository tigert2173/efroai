document.getElementById('fetchImageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const bucketName = document.getElementById('bucketName').value.trim();
    const userId = sessionStorage.getItem('characterUploader'); // Dynamic user ID from character data
    const charId = sessionStorage.getItem('selectedCharacterId'); // Dynamic character ID from character data
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

    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp']; // Add more extensions if needed

    let validImageUrl = null;

    for (const extension of imageExtensions) {
        try {
            const url = `https://efroai.net/bucket/${userId}/${charId}/${encodeURIComponent(objectKey)}${extension}`;
            // Use a fetch request to verify the existence of the image
            const response = await fetch(url, { method: 'HEAD' });
            if (response.ok) {
                validImageUrl = url;
                break;
            }
        } catch (error) {
            console.warn(`Image with extension ${extension} not found.`);
        }
    }

    if (!validImageUrl) {
        alert('No valid image found with the provided object key and supported extensions.');
        return;
    }

    // Get the selected image position (background, left, right)
    const imagePosition = document.querySelector('input[name="imagePosition"]:checked').value;

    // Clear side images and reset chat wrapper class before applying the new image
    leftImageContainer.innerHTML = '';
    rightImageContainer.innerHTML = '';
    chatWrapper.classList.remove('has-left-image', 'has-right-image');
    inputWrapper.classList.remove('has-left-image', 'has-right-image');

    try {
        if (imagePosition === 'background') {
            // Set the background image
            chatContainer.style.setProperty('--background-image', `url('${validImageUrl}')`);
            chatContainer.style.setProperty('--bg-opacity', 1);
        } else if (imagePosition === 'left') {
            // Set the left side image
            chatContainer.style.setProperty('--background-image', 'none');
            leftImageContainer.innerHTML = `<img src="${validImageUrl}" alt="Left Image" style="width: 100%; height: auto;">`;
            chatWrapper.classList.add('has-left-image');
            inputWrapper.classList.add('has-left-image');
        } else if (imagePosition === 'right') {
            // Set the right side image
            chatContainer.style.setProperty('--background-image', 'none');
            rightImageContainer.innerHTML = `<img src="${validImageUrl}" alt="Right Image" style="width: 100%; height: auto;">`;
            chatWrapper.classList.add('has-right-image');
            inputWrapper.classList.add('has-right-image');
        }
    } catch (error) {
        console.error("Error setting image:", error);
        alert('Failed to set image: ' + error.message);
    }
});
