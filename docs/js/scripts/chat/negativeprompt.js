const tokenSlider = document.getElementById("SettingsMaxTokensSlider");
const tokenDisplay = document.getElementById("SettingsMaxTokensValue");
const negativePrompt = document.getElementById("negativePrompt");
const optionV4 = document.getElementById("optionV4");
const optionV3 = document.getElementById("optionV3");
const optionV2 = document.getElementById("optionV2");
const explicitEncourage = document.getElementById("explicitEncourage");
const skunkAnatomyFix = document.getElementById("skunkAnatomyFix");
const speakerIdentifierOption = document.getElementById("speakerIdentifierOption");

// Function to update the options' values and text
function updateNegativePromptOptions(maxTokens) {
    optionV3.value = `Do not talk about sexual topics or explicit content. Ensure the response does not exceed ${maxTokens} tokens. If the response is close to the token limit, end naturally without abrupt cut-offs. Never repeat the last generation.`;
    optionV3.textContent = `Negative Prompt V3 (Token Limit: ${maxTokens})`;

    
    optionV2.value = `Do not talk about sexual topics or explicit content. Ensure the response does not exceed ${maxTokens} tokens. If the response is close to the token limit, end naturally without abrupt cut-offs.`;
    optionV2.textContent = `Negative Prompt V2 (Token Limit: ${maxTokens})`;
    // New option to allow sexual content with token limits and natural endings

    // New option for skunk anatomy correction with humor
    skunkAnatomyFix.value = `Ensure skunks' anatomy is accurate: spray comes from anal glands, and farts come from the anus. Ensure the response does not exceed ${maxTokens} tokens. If the response is close to the token limit, end naturally without abrupt cut-offs.`;
    skunkAnatomyFix.textContent = `[Beta] Skunk Anatomy Fix (For Accuracy)`;

    explicitEncourage.value = `Allow sexual or explicit content, ensuring the response stays within ${maxTokens} tokens and concludes naturally without abrupt cut-offs.`;
    explicitEncourage.textContent = `[Alpha] Explict Encouraged: May Get Too Horny`;

    optionV4.value = `Do not talk about sexual topics or explicit content. Ensure the response does not exceed ${maxTokens} tokens. Ensure the response ends in a natural way without cut-off, even when reaching the token limit. Never repeat the last generation.`;
    optionV4.textContent = `Negative Prompt V4 (Token Limit: ${maxTokens})`;

    // Add the speaker identifier prompt to the dropdown
    speakerIdentifierOption.value = "Please write the response with each sentence clearly labeled with a speaker identifier, like this: Speaker 1: [sentence] Speaker 2: [sentence]... Do not talk about sexual topics or explicit content. Ensure the response does not exceed ${maxTokens} tokens. If the response is close to the token limit, end naturally without abrupt cut-offs. Never repeat the last generation.";
    speakerIdentifierOption.textContent = `Speaker Identifier Request (Write each sentence with a speaker identifier)`;

}

// Initial set-up
updateNegativePromptOptions(tokenSlider.value - 48);

// Event listener for the slider
tokenSlider.addEventListener("input", () => {
    const maxTokens = tokenSlider.value - 48;
    tokenDisplay.textContent = `${maxTokens} Tokens`;
    updateNegativePromptOptions(maxTokens);
});