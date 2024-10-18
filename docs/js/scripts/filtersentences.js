function processMessageDataImportance() {
    const chatContainer = document.getElementById('chat-container');
    // messagedataimportance.messagehistory = chatContainer.textContent;
    messagedataimportance.messagehistory = getAllMessagesExceptLast();
    console.log(messagedataimportance.messagehistory);
    let fullText = messagedataimportance.messagehistory;

    // Step 1: Split the message history into sentences
    //let sentences = fullText.split(/(?<=\.)\s+/); // Splits by sentence, assuming period ends a sentence
    //BREAKS IOS 16 and BELOW //let sentences = fullText.split(/(?<=[.!?])\s+(?!\.\.\.)/); //"This is a sentence! And this is another? But this one... keeps going."
    //WORKS BUT DOESN'T GET Punctuation//let sentences = fullText.split(/[\.\!\?]+\s+/);
    //let sentences = fullText.replace(/([.!?])\s+/g, '$1|').split('|')
    // let sentences = fullText
    // .replace(/([.!?])\s+(?=[A-Z])/g, '$1|') // Replace punctuation followed by space and capital letter
    // .replace(/([.!?])\s+(?=\.\.\.)/g, '$1|') // Handle ellipses
    // .split('|');
// List of common abbreviations
const abbreviations = [
    'U.S.', 'e.g.', 'i.e.', 'Dr.', 'Mr.', 'Ms.', 'Mrs.', 'Inc.', 'Ltd.', 'Prof.', 'St.', 'Ave.'
  ];
  
  // Function to create a regex pattern for known abbreviations
  function getAbbreviationPattern(abbrList) {
    return abbrList.map(abbr => abbr.replace('.', '\\.')).join('|');
  }
  
  // Create the regex for matching abbreviations
  const abbreviationRegex = new RegExp(`\\b(?:${getAbbreviationPattern(abbreviations)})\\b`, 'g');
  
  let sentences = fullText
    // Normalize multiple spaces or tabs to a single space
    .replace(/\s+/g, ' ')
    // Temporarily replace known abbreviations with a unique placeholder
    .replace(abbreviationRegex, match => match.replace(/./g, '_')) // Replace dots with underscores
    // Replace sentence-ending punctuation followed by space and capital letter
    .replace(/([.!?])\s+(?=[A-Z])/g, '$1|')
    // Handle ellipses and prevent splitting after them
    .replace(/([.!?])\s+(?=\.\.\.)/g, '$1|')
    // Restore placeholders to their original form
    .replace(/_/g, '.')
    // Split the text into sentences
    .split('|')
    // Trim each sentence to remove any leading/trailing whitespace
    .map(sentence => sentence.trim())
    // Filter out any empty sentences
    .filter(sentence => sentence.length > 0);
  
  // Result: 'sentences' contains the split sentences
  

    // Step 2: Get the last # sentences
    let numLastSentences = parseInt(ESettingslastNUMsentencesSlider.value, ESettingslastNUMsentencesSlider.value);
    let lastSentences = sentences.slice(-numLastSentences).join(' '); // Take the last X sentences

    // Step 3: Get the sentences before the last X sentences
    let remainingSentences = sentences.slice(0, sentences.length - numLastSentences)
    .filter(sentence => !sentence.includes('◀') && !sentence.includes('▶')); // Exclude sentences with ◀ or ▶

    // Filter out any sentences containing the last bot message
    if (lastBotMsg) {
        remainingSentences = remainingSentences.filter(sentences => !sentences.includes(lastBotMsg));
        console.log("Removed: " + sentences + " || " + lastBotMsg)
    }

    // Step 4: Generate weights for sentences, inversely proportional to their index
    let weightedSentences = remainingSentences.map((sentence, index) => ({
        sentence: sentence,
        weight: remainingSentences.length - index
    }));
    let totalWeight = weightedSentences.reduce((a, b) => a + b.weight, 0);

    // Function to select a weighted random item
    function getRandomWeightedIndex() {
        let random = Math.random() * totalWeight;
        for (let i = 0; i < weightedSentences.length; i++) {
            if (random < weightedSentences[i].weight) {
                return i;
            }
            random -= weightedSentences[i].weight;
        }
        return weightedSentences.length - 1; // Fallback to the last item
    }

    // Debugging: Log weights and sentences
    console.log('Weighted Sentences:', weightedSentences);

    // Step 5: Randomly select X sentences from the weighted list
    let numRandomSentences = parseInt(ESettingsRandomNUMsentencesSlider.value, ESettingsRandomNUMsentencesSlider.value);
    let selectedSentences = [];
    for (let i = 0; i < Math.min(numRandomSentences, weightedSentences.length); i++) {
        const index = getRandomWeightedIndex();
        selectedSentences.push(weightedSentences[index]);
        console.log(`Selected Sentence: "${weightedSentences[index].sentence}" with weight ${weightedSentences[index].weight}`);

        // Remove selected sentence and corresponding weight from the list to avoid repetition
        weightedSentences.splice(index, 1);
        totalWeight = weightedSentences.reduce((a, b) => a + b.weight, 0); // Recalculate total weight
    }

    // Sort selected sentences by their weights
    selectedSentences.sort((b, a) => b.weight - a.weight);

    // Step 6: Combine the last X sentences and the randomly selected sentences
    let finalText = selectedSentences.map(item => item.sentence).join(' ') + "\n\n" + lastSentences;

    // Step 7: Display or use the result
    messagedataimportance.messagehistorytrimmed = finalText;
    //document.getElementById('advanced-debugging').value = messagedataimportance.messagehistorytrimmed;
}