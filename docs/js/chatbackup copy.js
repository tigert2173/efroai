document.addEventListener('DOMContentLoaded', () => {
    const ESettingslastNUMsentencesSlider = document.getElementById('ESettingslastNUMsentencesSlider');
    const ESettingslastNUMsentencesValue = document.getElementById('ESettingslastNUMsentencesValue');

    ESettingslastNUMsentencesSlider.addEventListener('input', () => {
        ESettingslastNUMsentencesValue.textContent = "Last " + ESettingslastNUMsentencesSlider.value + " Sentences";
        // Here you can add code to handle the setting change
        // For example, updating a global setting or sending it to a server
    });
});
document.addEventListener('DOMContentLoaded', () => {
    const ESettingsRandomNUMsentencesSlider = document.getElementById('ESettingsRandomNUMsentencesSlider');
    const ESettingsRandomNUMsentencesValue = document.getElementById('ESettingsRandomNUMsentencesValue');

    ESettingsRandomNUMsentencesSlider.addEventListener('input', () => {
        ESettingsRandomNUMsentencesValue.textContent = "Select " + ESettingsRandomNUMsentencesSlider.value + " Random Sentences";
        // Here you can add code to handle the setting change
        // For example, updating a global setting or sending it to a server
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const SettingsMaxTokensSlider = document.getElementById('SettingsMaxTokensSlider');
    const SettingsMaxTokensValue = document.getElementById('SettingsMaxTokensValue');

    SettingsMaxTokensSlider.addEventListener('input', () => {
    SettingsMaxTokensValue.textContent = SettingsMaxTokensSlider.value + " Tokens";
        // Here you can add code to handle the setting change
        // For example, updating a global setting or sending it to a server
    });
});

function toggleExpertSettings() {
    const checkbox = document.getElementById('show-expert');
    const expertSettings = document.getElementById('expert-settings');

    // If the checkbox is checked, display the expert settings
    if (checkbox.checked) {
        expertSettings.style.display = 'block';
    } else {
        expertSettings.style.display = 'none';
    }
}


var messagessent = 0;

setInterval(checkAPIStatus, 60000); // Check API status every 60 seconds

async function checkAPIStatus() {
    const statusTextElement = document.getElementById('api-status-text');
    statusTextElement.textContent = 'Checking';
    statusTextElement.className = 'status-checking';

    try {
        // Fetch the data from the two APIs
        const [notDownResponse, listedResponse] = await Promise.all([
            fetch('https://api.botbridge.net/api/servers-not-down'),
            fetch('https://api.botbridge.net/api/servers-listed')
        ]);

        // Parse the JSON data from responses
        const serversNotDown = await notDownResponse.json();
        const serversListed = await listedResponse.json();

        const totalServers = serversListed.listedCount; // Total number of servers listed
        const operationalServers = serversNotDown.notDownCount; // Number of servers operational

        console.log(`Total Servers: ${totalServers}, Operational Servers: ${operationalServers}`);

        // Calculate the percentage of operational servers
        const operationalPercentage = (operationalServers / totalServers) * 100;
        const speedIndicator = document.getElementById('speed-indicator');
        speedIndicator.style.width = `${operationalPercentage}%`;

        // Update the status based on the percentage of operational servers
        if (totalServers === 0) {
            statusTextElement.textContent = 'No Servers Listed';
            statusTextElement.className = 'status-code';
        } else if (operationalPercentage === 100) {
            statusTextElement.textContent = 'All Systems Operational';
            statusTextElement.className = 'status-operational';
        } else if (operationalPercentage >= 90) {
            statusTextElement.textContent = 'Fully Functional';
            statusTextElement.className = 'status-fully-functional';
        } else if (operationalPercentage >= 75) {
            statusTextElement.textContent = 'Mostly Functional';
            statusTextElement.className = 'status-mostly-functional';
        } else if (operationalPercentage >= 50) {
            statusTextElement.textContent = 'Partially Functional';
            statusTextElement.className = 'status-partially-functional';
        } else if (operationalPercentage >= 25) {
            statusTextElement.textContent = 'Degraded Service';
            statusTextElement.className = 'status-degraded-service';
        } else if (operationalPercentage > 0) {
            statusTextElement.textContent = 'Limited Availability';
            statusTextElement.className = 'status-limited-availability';
        } else {
            statusTextElement.textContent = 'All Services Offline';
            statusTextElement.className = 'status-offline';
        }            
    } catch (error) {
        statusTextElement.textContent = 'Error: Unable to Reach Server';
        statusTextElement.className = 'status-error';
    }
   
}



function populateCharacterSettings() {
    // Retrieve the character data from sessionStorage
    const selectedCharacterId = sessionStorage.getItem('selectedCharacterId');
    const characterUploader = sessionStorage.getItem('characterUploader');

    // Fetch the character data from the backend
    const url = `https://characters.efroai.net:3000/api/chat/${characterUploader}/${selectedCharacterId}`;
    
    fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(character => {
            // Define the character object
            const characterData = {
                uploader: character.uploader || '',
                persona: character.persona || '',
                context: character.context || '',
                scenario: character.scenario || '',
                greeting: character.greeting || '',
                exampledialogue: character.exampledialogue || ''
            };

            // Populate each field with the character's data
            document.getElementById('user-name').value = characterData.uploader;
            document.getElementById('persona').value = characterData.persona;
            document.getElementById('context').value = characterData.context;
            document.getElementById('scenario').value = characterData.scenario;
            document.getElementById('greeting').value = characterData.greeting;
            document.getElementById('exampledialogue').value = characterData.exampledialogue;

            // Update settings
            settings.persona = characterData.persona;
            settings.context = characterData.context;
            character.greeting = characterData.greeting;
            character.scenario = characterData.scenario;
            character.exampledialogue = characterData.exampledialogue;
            // Display the greeting as a bot message
            displayMessage(characterData.greeting, 'bot'); // Display greeting as bot message
        })
        .catch(error => {
            console.error('Error fetching character data:', error);
        });
}

function loadCharacter(charName, listItem) {
    clearCurrentBotMessage();

    const characterData = sessionStorage.getItem('chatbotCharacter_' + charName);
    if (characterData) {
        settings = JSON.parse(characterData);
        document.getElementById('persona').value = settings.persona;
        document.getElementById('context').value = settings.context;
        document.getElementById('greeting').value = settings.greeting;
        document.getElementById('temperature').value = settings.temperature;
        document.getElementById('model').value = settings.model;
        highlightCharacter(listItem);
        sendGreeting(); // Send greeting message on character load
    } else {
        alert('Character not found.');
    }
}

function highlightCharacter(selectedItem) {
    const listItems = document.querySelectorAll('#character-list li');
    listItems.forEach(item => item.classList.remove('selected'));
    selectedItem.classList.add('selected');
}

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
                    document.getElementById('temperature').value = jsonData.temperature || 0.5; // Default value if temperature is not provided

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

function updateSettings() {
    checkAPIStatus();
    //processMessageDataImportance();
    if (messagessent.value > 8) {
        settings.persona = document.getElementById('persona').value;
        settings.context = document.getElementById('context').value;
        settings.greeting = '';
        settings.temperature = parseFloat(document.getElementById('temperature').value);
        settings.model = document.getElementById('model').value;
    } else {
        settings.persona = document.getElementById('persona').value;
        settings.context = document.getElementById('context').value;
        settings.greeting = document.getElementById('greeting').value;
        settings.temperature = parseFloat(document.getElementById('temperature').value);
        settings.model = document.getElementById('model').value;

        //Controlled Message Data Importance
        messagedataimportance.lusermsg = lastUserMessage;

        //document.getElementById('advanced-debugging').value = messagedataimportance.lusermsg;
    }
}

let lastBotMessage = ''; // Variable to store the last bot message
let lastUserMessage = ''; // Variable to store the last user message

// Function to clear the content of the current bot message element
function clearCurrentBotMessage() {
    if (currentBotMessageElement) {
        currentBotMessageElement.innerHTML = ''; // Clear the existing content
        lastBotMessage = ''; // Clear the last bot message content
    }
}

let messagedataimportance = {
    lusermsg: '',
    messagehistory: '',
    messagehistorytrimmed: '',
};

function getAllMessagesExceptLast() {
    const chatContainer = document.getElementById('chat-container');

    // Select all message elements
    const messageElements = chatContainer.querySelectorAll('.message');

    // If there are less than two messages, return an empty string
    if (messageElements.length < 2) {
        return '';
    }

    // Get all messages except the last one
    const messagesExceptLast = Array.from(messageElements)
    .slice(0, -1) // Exclude the last message
    .map(message => message.textContent.trim()) // Get text content of each message
    .join(' '); // Join all messages into a single string

    return messagesExceptLast;
}

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

let settings = {
    persona: '',
    context: '',
    scenario: '',
    greeting: '',
    exampledialogue: '',
    temperature: 0.8,
    model: '',
    top_p: 1, //Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P.
    min_p: 0.05, //Sets a minimum base probability threshold for token selection.
    top_k: 40, //Limit the next token selection to the K most probable tokens.
    prescence_penalty: 0.05, //encourge new topics
    frequency_penalty: 0.0, //penalty for repetition
    repeat_penalty: 1,
};

async function sendMessage() {
    document.getElementById('advanced-debugging').value = currentBotMessageElement.innerHTML;
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    if (!message) return;

    if (!isResend) {
        processMessageDataImportance();
        lastBotMsg = currentBotMessageElement.textContent || currentBotMessageElement.innerHTML;
        console.log('Updated lastBotMsg:', lastBotMsg);
        lastUserMessage = message;
        messagessent = messagessent + 1;
        document.getElementById('messages-sent').value = messagessent;
        displayMessage(message, 'user');
        userInput.value = '';
        botMessages = [];
        currentBotMessageElement = null;
    }

    lastBotMsg = lastBotMsg ? lastBotMsg : settings.greeting;

    if (document.getElementById('model').value == '') {
        document.getElementById('model').value = 'https://hose-apparatus-wilderness-computer.trycloudflare.com';
    }

    const systemPrompt = "Write {{char}}'s next response in a fictional role-play between {{char}} and {{user}}.";

    try {    
        updateSettings();
        const requestData = {
            messages: [
                {
                    role: 'system',
                    content: `${systemPrompt}` // Keep this at the beginning for instruction/context
                },
                {
                    role: 'user',
                    content: message // Place user message right after the system prompt
                },
                {
                    role: 'assistant',
                    content: `${lastBotMsg} ${messagedataimportance.messagehistorytrimmed} ${settings.context} ${settings.scenario} ${settings.persona}`
                }
            ],              
            max_tokens: SettingsMaxTokensSlider.value,
            stream: true,
            temperature: settings.temperature,
            top_p: settings.top_p,
            repeat_penalty: settings.repeat_penalty, 
            min_p: settings.min_p,
            top_k: settings.top_k, 
            prescence_penalty: settings.prescence_penalty, 
            frequency_penalty: settings.frequency_penalty
        };

        console.log('Request Data:', JSON.stringify(requestData, null, 2));

        const response = await fetch("http://127.0.0.1:5000/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            displayBotMessage(errorData.message || 'Unknown error occurred.', 'temporary-notice');
            return; // Exit early if the request failed
        }

        if (response.body) {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let result = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                const matches = chunk.match(/"content":\s*"([^"]*)"/);
                if (matches && matches[1]) {
                    const content = matches[1];
                    result += content;
                    clearCurrentBotMessage();
                    displayMessage(result, 'bot', false);
                }
            }

            if (result) {
                clearCurrentBotMessage();
                displayMessage(result, 'bot', true);
            }
        } else {
            const data = await response.json();
            const botMessage = data.choices[0].message.content;
            displayMessage(botMessage, 'bot', false);
        }

    } catch (error) {
        console.error('Error:', error);
        displayBotMessage('Sorry, there was an error processing your request.', 'temporary-notice');
    } finally {
        isResend = false;
    }
}

function displayBotMessage(message, type) {
    const messageElement = document.createElement('div');
    messageElement.className = 'bot-message ' + type; // Add type for specific styling
    messageElement.textContent = message;
    document.getElementById('chat-container').appendChild(messageElement); // Adjust the container ID as needed

    // Automatically remove the notice after a few seconds
    setTimeout(() => {
        messageElement.remove();
    }, 10000); // Adjust the duration as needed
}

function usernameupdated () {

    if ( messagessent == 0) {
        currentBotMessageElement.innerHTML = '';
        const greeting = settings.greeting;
        displayMessage(greeting, 'bot');
    }
}


function sendGreeting() {
    messagessent = 0;
    const greeting = settings.greeting;
    if (greeting) {
        displayMessage(greeting, 'bot');
    }
}

let userName = '{{user}}';
let currentBotMessageElement = null;
let botMessages = []; // Array to store bot messages
let currentBotMessageIndex = -1; // Index to track current bot message
let lastBotMsg = null;

function displayMessage(content, sender, isFinal = false) {

    userName = document.getElementById('user-name').value.trim();
    if (!userName) { userName = "{{user}}" }

    const chatContainer = document.getElementById('chat-container');
    const sanitizedContent = content
    .replace(/([.!?])(?!\.\.\.)(\s*)/g, "$1 ") // Ensure single space after . ? !
    .replace(/\\n/g, '<br>') // Convert literal \n to <br>
    .replace(/\\(?!n)/g, '') // Remove backslashes not followed by n
    .replace(/\n/g, '<br>') // Convert newline characters to <br> (if needed)
    .replace(/\*(.*?)\*/g, '<i>$1</i>') // Convert *text* to <i>text</i>
    //.replace(/(\r\n|\n|\r)/g, '<br>') // Convert all types of newlines to <br>
    //.replace(/\\n/g, '<br>') // Replace literal \n with <br>
    //.replace(/\\(?!n)/g, '') // Remove any backslashes not followed by 'n'
    //.replace(/\\/, '') // Remove backslashes
    //.replace(/\*(.*?)\*/g, '<i>$1</i>'); // Replace *text* with <i>text</i>
    .replace(/{{user}}/g, userName) // Replace {{user}} with the actual user name
    //.replace(/{{char}}/g, charName); // Replace {{char}} with the file char name


    if (sender === 'bot') {
        // Remove previous bot message header if exists
        const previousHeader = document.querySelector('.message-header');
        if (previousHeader) {
            previousHeader.remove();
        }

        // Create a new message header with navigation arrows
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        messageHeader.innerHTML = `
        <span class="nav-arrows ${currentBotMessageIndex === 0 ? 'disabled' : ''}" onclick="navigateBotMessages(-1)">&#9664;</span>
        <span class="nav-arrows ${currentBotMessageIndex === botMessages.length - 1 ? 'disabled' : ''}" onclick="navigateBotMessages(1)">&#9654;</span>
        `;

        // Create or update the current bot message element
        if (!currentBotMessageElement) {
            currentBotMessageElement = document.createElement('div');
            currentBotMessageElement.className = `message ${sender}`;
            chatContainer.appendChild(currentBotMessageElement);
        }

        // Append message header and content
        chatContainer.insertBefore(messageHeader, currentBotMessageElement);
        currentBotMessageElement.innerHTML += sanitizedContent;

        if (isFinal) {
            botMessages.push(currentBotMessageElement.innerHTML);
            currentBotMessageIndex = botMessages.length - 1;
        }

        // Update arrow states
        updateArrowStates();
    } else {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.innerHTML = sanitizedContent;
        chatContainer.appendChild(messageElement);
    }

    // chatContainer.scrollTop = chatContainer.scrollHeight; //Scrolls to bottom as new message is generated.
    //document.getElementById('advanced-debugging').value = chatContainer.textContent;

    //messagedataimportance.messagehistory = chatContainer.textContent;
    const lastBotMessageElement = chatContainer.querySelector('.message.bot:last-child'); // Select the last bot message element
}
let isResend = false;

function regenerateMessage() {
    // Remove the last bot message from the context
    if (lastUserMessage) {
        settings.context = settings.context.replace(lastBotMessage, '').trim(); // Use last bot message

        clearCurrentBotMessage(); // Clear the last bot message
        isResend = true; // Set flag to indicate resend
        document.getElementById('user-input').value = lastUserMessage;

        sendMessage(); // Resend the last user message
    } else {
        displayMessage('No previous user message found to regenerate.', 'bot');
    }
}

function navigateBotMessages(direction) {
    if (currentBotMessageIndex === -1) return; // No messages to navigate

    const newIndex = currentBotMessageIndex + direction;
    if (newIndex >= 0 && newIndex < botMessages.length) {
        currentBotMessageIndex = newIndex;
        const content = botMessages[currentBotMessageIndex];
        currentBotMessageElement.innerHTML = content;


        // Update lastBotMessage to the current content
        lastBotMsg = currentBotMessageElement.textContent || currentBotMessageElement.innerHTML;
        console.log('Updated lastBotMsg (navigated):', lastBotMsg);

        // Update arrow states
        updateArrowStates();
    }
}


async function updateQueueCounter() {
    // Fetch the number of jobs in the queue
    const queueCount = document.querySelector('#queue-count');
    const queueResponse = await fetch('https://api.botbridge.net/api/queue-status');
    const queueData = await queueResponse.json();
    const queueLength = queueData.queueLength;
    queueCount.textContent = queueLength;

    // Apply color class based on queue length
    if (queueLength >= 3 && queueLength <= 10) {
        queueCount.className = 'queue medium';
    } else if (queueLength > 10) {
        queueCount.className = 'queue high';
    } else {
        queueCount.className = 'queue low';
    }
}

// Fetch queue status every 5 seconds
setInterval(updateQueueCounter, 5000);

function updateArrowStates() {
    const leftArrow = document.querySelector('.nav-arrows:first-of-type');
    const rightArrow = document.querySelector('.nav-arrows:last-of-type');

    if (leftArrow) {
        leftArrow.classList.toggle('disabled', currentBotMessageIndex === 0);
    }
    if (rightArrow) {
        rightArrow.classList.toggle('disabled', currentBotMessageIndex === botMessages.length - 1);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    checkAPIStatus();
    populateCharacterSettings();
});
