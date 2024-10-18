function uploadCharacter() {
    const fileInput = document.getElementById('upload-json');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const jsonData = JSON.parse(event.target.result);

                // Check for the expected fields in the JSON
                if (jsonData.char_persona && jsonData.char_greeting && jsonData.world_scenario) {
                    // Update the HTML elements with the JSON data
                    document.getElementById('persona').value = jsonData.char_persona;
                    document.getElementById('context').value = jsonData.world_scenario;
                    document.getElementById('greeting').value = jsonData.char_greeting;
                    document.getElementById('temperature').value = jsonData.temperature || 0.85; // Default value if temperature is not provided

                    alert('Character uploaded and settings updated successfully!');
                } else {
                    alert('Invalid JSON format. Ensure it contains the necessary fields.');
                }
            } catch (e) {
                alert('Failed to parse JSON.');
            }
        };
        reader.readAsText(file);
        addNewCharacter();
    } else {
        alert('Please select a file to upload.');
    }
}



function highlightCharacter(selectedItem) {
    const listItems = document.querySelectorAll('#character-list li');
    listItems.forEach(item => item.classList.remove('selected'));
    selectedItem.classList.add('selected');
}