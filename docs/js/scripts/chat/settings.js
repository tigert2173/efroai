document.getElementById('toggleSettings').addEventListener('click', function() {
    const settings = document.querySelectorAll('.setting');
    settings.forEach(setting => {
        setting.classList.toggle('hidden');
    });
});
    function showTooltip(event) {
const selectElement = event.target;
const tooltip = document.getElementById('tooltip');

// Get the currently selected option
const selectedOption = selectElement.options[selectElement.selectedIndex];

// Set tooltip content
tooltip.textContent = selectedOption.getAttribute('data-description');

// Position the tooltip
const rect = selectElement.getBoundingClientRect();
tooltip.style.left = `${rect.left}px`;
tooltip.style.top = `${rect.bottom + window.scrollY}px`;

// Show the tooltip
tooltip.style.display = 'block';
}

function hideTooltip() {
const tooltip = document.getElementById('tooltip');
tooltip.style.display = 'none';
}