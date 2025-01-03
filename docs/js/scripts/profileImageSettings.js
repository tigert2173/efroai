// Get the token from local storage
const token = localStorage.getItem('token'); 

// Handle profile image upload
const uploadImageButton = document.getElementById('upload-image-button');
const profileImageInput = document.getElementById('profile-image');
const uploadedImageContainer = document.getElementById('profile-image-container');

// Event listener for the input change (for previewing the image before uploading)
profileImageInput.addEventListener('change', function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const previewImage = document.createElement('img');
            previewImage.src = e.target.result;
            previewImage.width = 200; // Set a fixed size for preview
            // Replace the existing image preview or add new
            uploadedImageContainer.innerHTML = '';
            uploadedImageContainer.appendChild(previewImage);
        };
        reader.readAsDataURL(file);
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

// Function to compress the image
function compressImage(file, quality = 0.7, maxWidth = 800, maxHeight = 800) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();
        
        reader.onload = function (e) {
            img.src = e.target.result;
        };
        
        reader.onerror = reject;
        reader.readAsDataURL(file);

        img.onload = function () {
            let width = img.width;
            let height = img.height;

            // Scale down the image to the desired size
            if (width > height) {
                if (width > maxWidth) {
                    height *= maxWidth / width;
                    width = maxWidth;
                }
            } else {
                if (height > maxHeight) {
                    width *= maxHeight / height;
                    height = maxHeight;
                }
            }

            // Create a canvas to resize the image
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);

            // Compress the image to JPEG format with the desired quality
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/jpeg', quality);
        };
    });
}

// Event listener for the upload button
uploadImageButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const file = profileImageInput.files[0];
    if (file) {
        try {
            // Compress the image before uploading
            const compressedImage = await compressImage(file);

            const formData = new FormData();
            formData.append('profile-image', compressedImage, file.name); // Append the compressed image

            // Send the image to the server
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
