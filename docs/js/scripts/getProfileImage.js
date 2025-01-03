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
            //alert('Profile image not found.');
        }
    } catch (error) {
        console.error('Error fetching profile image:', error);
        //alert('Error fetching profile image!');
    }
}