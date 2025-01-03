// Get the token from local storage
const token = localStorage.getItem('token'); 

// Handle profile image upload
const uploadImageButton = document.getElementById('upload-image-button');
const profileImageInput = document.getElementById('profile-image');
const uploadedImageContainer = document.getElementById('profile-image-container');

// Handle profile image upload with compression
profileImageInput.addEventListener('change', async function (event) {
    const file = event.target.files[0];
    if (file) {
        try {
            const compressedDataUrl = await compressImage(file);
            const previewImage = document.createElement('img');
            previewImage.src = compressedDataUrl;
            previewImage.width = 200; // Set a fixed size for preview
            // Replace the existing image preview or add new
            uploadedImageContainer.innerHTML = '';
            uploadedImageContainer.appendChild(previewImage);
        } catch (error) {
            console.error('Error compressing image:', error);
            alert('Error compressing image!');
        }
    }
});

const profileImageContainer = document.getElementById('profile-image-container');

// Function to fetch the user's profile image (without extension)
async function fetchProfileImage(username) {
    try {
        // Make the GET request to fetch the image without the extension
        const response = await fetch(`https://characters.efroai.net/api/profile-picture/${username}`);
        
        if (response.ok) {
            // The server will return the image file directly, so we set it as the image src
            const imageUrl = `https://characters.efroai.net/api/profile-picture/${username}`;
            profileImageContainer.innerHTML = `<img src="${imageUrl}" alt="Profile Image" width="200" />`;
        } else {
            alert('Profile image not found.');
        }
    } catch (error) {
        console.error('Error fetching profile image:', error);
        alert('Error fetching profile image!');
    }
}

// Function to get the value of a specific cookie
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
        return parts.pop().split(';').shift();
    }
    return null;
}

// Example usage: Fetch the profile image for a user (e.g., 'john_doe')
fetchProfileImage(getCookie('userID'));

// Event listener for the upload button (with compressed image)
uploadImageButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const file = profileImageInput.files[0];
    if (file) {
        try {
            const compressedDataUrl = await compressImage(file);

            const formData = new FormData();
            formData.append('profile-image', compressedDataUrl); // Use the compressed image data URL

            // Send the compressed image to the server
            const response = await fetch('https://characters.efroai.net/api/upload/profile-picture', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                body: formData,
            });

            if (response.ok) {
                const result = await response.json();
                if (result.imageUrl) {
                    // Display the uploaded image
                    uploadedImageContainer.innerHTML = `<img src="${result.imageUrl}" alt="Profile Image" width="200" />`;
                } else {
                    alert('Image upload failed!');
                }
            } else {
                alert('Error uploading image!');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image!');
        }
    } else {
        alert('Please select an image to upload.');
    }
});

// Function to compress the image and log the size
function compressImage(file, maxWidth = 800, maxHeight = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                // Create a canvas to resize the image
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set the canvas dimensions based on the max width and height
                let width = img.width;
                let height = img.height;
                
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(maxWidth / width, maxHeight / height);
                    width = width * ratio;
                    height = height * ratio;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                // Draw the image on the canvas
                ctx.drawImage(img, 0, 0, width, height);
                
                // Compress the image by converting it to a data URL
                canvas.toDataURL('image/jpeg', quality, async function (compressedDataUrl) {
                    // Create a Blob from the Data URL to get the size
                    const byteString = atob(compressedDataUrl.split(',')[1]);
                    const arrayBuffer = new ArrayBuffer(byteString.length);
                    const uintArray = new Uint8Array(arrayBuffer);

                    for (let i = 0; i < byteString.length; i++) {
                        uintArray[i] = byteString.charCodeAt(i);
                    }

                    const blob = new Blob([uintArray], { type: 'image/jpeg' });

                    // Log the size of the compressed image
                    console.log('Compressed Image Size: ' + blob.size + ' bytes');
                    
                    resolve(compressedDataUrl);
                });
            };
            img.onerror = reject;
            img.src = e.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}