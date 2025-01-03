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
    const extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];  // Common image formats
    let imageUrl = '';

    // Try fetching the image with different extensions
    for (const ext of extensions) {
        try {
            const response = await fetch(`https://characters.efroai.net/users/images/${username}${ext}`);
            
            if (response.ok) {
                imageUrl = `https://characters.efroai.net/users/images/${username}${ext}`;
                break; // Exit the loop once a valid image URL is found
            }
        } catch (error) {
            // Ignore errors and continue with the next extension
            continue;
        }
    }

    // If an image URL was found, display it
    if (imageUrl) {
        profileImageContainer.innerHTML = `<img src="${imageUrl}" alt="Profile Image" width="200" />`;
    } else {
        alert('Profile image not found.');
    }
}


// Example usage: Fetch the profile image for a user (e.g., 'john_doe')
fetchProfileImage('tigert2173');

// Event listener for the upload button
uploadImageButton.addEventListener('click', async (event) => {
    event.preventDefault();

    const file = profileImageInput.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('profile-image', file); // Field name should match backend

        // Send the image to the server
        try {
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
