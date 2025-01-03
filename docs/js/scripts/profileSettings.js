    // Get the token from local storage
    const token = localStorage.getItem('token'); 

    // Handle profile image upload
    const uploadImageButton = document.getElementById('upload-image-button');
    const profileImageInput = document.getElementById('profile-image');
    const uploadedImageContainer = document.getElementById('uploaded-image-container');
    
    // Event listener for the upload button
    uploadImageButton.addEventListener('click', async (event) => {
        event.preventDefault();

        const file = profileImageInput.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('profile-image', file);

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
                    if (result.success) {
                        // Display the uploaded image
                        const imageUrl = result.imageUrl; // Assuming the server returns the image URL
                        uploadedImageContainer.innerHTML = `<img src="${imageUrl}" alt="Profile Image" width="200" />`;
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