const { saveChat, updateSavedChatsList, loadChat } = require('./path/to/your/file');

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
    const url = `https://characters.efroai.net:443/api/chat/${characterUploader}/${selectedCharacterId}`;
    
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
            settings.greeting = characterData.greeting;
            settings.scenario = characterData.scenario;
            settings.exampledialogue = characterData.exampledialogue;
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

function updateSettings() {
    checkAPIStatus();
    //processMessageDataImportance();
    settings.persona = document.getElementById('persona').value;
    settings.context = document.getElementById('context').value;
    settings.greeting = document.getElementById('greeting').value;
    settings.temperature = parseFloat(document.getElementById('temperature').value);
    settings.model = document.getElementById('model').value;

    //Controlled Message Data Importance
    messagedataimportance.lusermsg = lastUserMessage;

     //document.getElementById('advanced-debugging').value = messagedataimportance.lusermsg;
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
    temperature: 1.05,
    model: '',
    maxTokens: 256,
    topP: 0.85, //Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P.
    typical_p: 1, 
    minP: 0.00, //Sets a minimum base probability threshold for token selection.
    topK: 30, //Limit the next token selection to the K most probable tokens.
    systemPrompt: "",
    prescence_penalty: 0.15, //Slightly encourge new topics
    frequency_penalty: 0.05, //penalty for repetition
    repetitionPenalty: 1.15,
    systemPrompt: "Write {{char}}'s next response in a fictional role-play between {{char}} and {{user}}.",
    negativePrompt: "Do not talk about sexual topics or explicit content.",
    context: "",
    enablePreload: false, // Default to false if not provided
    sessionId: 1,
};

async function sendMessage() {
    document.getElementById('advanced-debugging').value = currentBotMessageElement.innerHTML;
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
   // if (!message) return;
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

    lastBotMsg = lastBotMsg || settings.greeting;

    if (document.getElementById('model').value == '') {
        document.getElementById('model').value = 'https://hose-apparatus-wilderness-computer.trycloudflare.com';
    }

    try {    
        updateSettings();
        // Construct the conversation context
        // conversationContext.push(`User: ${settings.message}`); // Append user message

        // // Limit the context size
        // if (conversationContext.length > 4096) {
        //     conversationContext.shift(); // Remove the oldest message
        // }

        // Create the full prompt for the bot
        //const fullPrompt = `${settings.systemPrompt}\n${conversationContext.join('\n')}\nAssistant: ${settings.lastBotMsg || ''}`;
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
            stream: true,
            
            //systemPrompt: `${settings.systemPrompt} ${settings.persona} ${settings.scenario} ${settings.context}`, // Concatenate persona and scenario
            systemPrompt: `
            ${settings.systemPrompt}
            Persona: ${settings.persona}
            Scenario: ${settings.scenario}
            ${settings.context ? `Context: ${settings.context}` : ''}
            ${settings.negativePrompt ? `Negative Prompt: ${settings.negativePrompt}` : ''}
        `,
            prompt: `Assistant: ${messagedataimportance.messagehistorytrimmed} ${lastBotMsg} \n User: ${message}`,
          // prompt: "Tell me about yourself",
           // prompt: `User: ${message}\nAssistant: ${lastBotMsg || ''}`,
          //  enablePreload: settings.enablePreload, // Default to false if not provided
           // sessionId: settings.sessionId,
          //  userId: 'TigerT2173', // Make sure to use a unique identifier
       //    "repetitionPenalty": settings.repetitionPenalty,
          //      "maxTokens": SettingsMaxTokensSlider.value,
          //      "frequency_penalty": settings.frequency_penalty,
           //     "temperature": settings.temperature,
           //     conversationContext: messagedataimportance.messagehistorytrimmed,
              //  negativePrompt: settings.negativePrompt,
                max_tokens: settings.maxTokens,
                temperature: settings.temperature,
                min_p: settings.minP,
                top_k: settings.topK,
                top_p: settings.topP,
              //  seed: 10000,
             //   signal: AbortSignal;
            //    stopOnAbortSignal: boolean;
             //   trimWhitespaceSuffix: boolean;
            //    evaluationPriority: EvaluationPriority;
             //   repeatPenalty: false | LlamaChatSessionRepeatPenalty,
             //   tokenBias: TokenBias | () => TokenBias;
             
             
             //   customStopTriggers: (LlamaText | string | (string | Token)[])[];
                  //  ${messagedataimportance.messagehistorytrimmed} 
                       //  "model": "string",
           //     "top_p": settings.top_p,
            //    "user": "{{user}}",
            //    "mode": "chat",
              //  "instruction_template": "string",
               // "instruction_template_str": "string",
              // "character": settings.persona,
              //  "name2": "string",
              //  "char_bio": settings.persona,
              // "context": "Persona: " + settings.persona + "\nScenario: " + settings.scenario + "\nContext: " + settings.context,
               // "greeting": messagedataimportance.messagehistorytrimmed + "\n" + lastBotMsg,
             //   "name1": "string",
             //   "user_bio": "string",
             //   "chat_template_str": "string", //Jinja2 template for chat.
             //   "chat_instruct_command": "string",
              //  "continue_": false, //Makes the last bot message in the history be continued instead of starting a new message.
              //  "preset": "string", //Parameters:
              ///  "min_p": settings.min_p,
              //  "dynamic_temperature": false,
              //  "dynatemp_low": 1,
              //  "dynatemp_high": 1,
              //  "dynatemp_exponent": 1,
               // "smoothing_factor": 0,
               // "smoothing_curve": 1,
             ///   "top_k": settings.top_k,
              //  "repetition_penalty_range": 1024,
              ///  "typical_p": settings.typical_p,
              //  "tfs": 1,
              //  "top_a": 0,
              //  "epsilon_cutoff": 0,
               // "eta_cutoff": 0,
               // "guidance_scale": 1,
               // "negative_prompt": "", //Implement
              //  "penalty_alpha": 0,
               /// "mirostat_mode": 0,
               // "mirostat_tau": 5,
               // "mirostat_eta": 0.1,
               // "temperature_last": false,
               // "do_sample": true,
               // "seed": -1,
               // "encoder_repetition_penalty": 1,
               // "no_repeat_ngram_size": 0,
              //  "dry_multiplier": 0,
               // "dry_base": 1.75,
               // "dry_allowed_length": 2,
              //  "dry_sequence_breakers": "\"\\n\", \":\", \"\\\"\", \"*\"",
              //  "truncation_length": 0,
              //  "max_tokens_second": 0,
              //  "prompt_lookup_num_tokens": 0,
              //  "custom_token_bans": "",
              //  "sampler_priority": [
              //    "string"
             //   ],
              ///  "auto_max_new_tokens": false,
              //  "ban_eos_token": false,
             //   "add_bos_token": true,
              //  "skip_special_tokens": true,
             //   "grammar_string": ""
                            // "function_call": "string",
               // "functions": [
                //  {}
             //    ],
              //  "logit_bias": {},
              //  "n": 1,
           //     "presence_penalty": settings.repeat_penalty,
               // "stop": [
              //    "string"
               // ],
            //    "stream": true,
              };

        console.log('Request Data:', JSON.stringify(requestData, null, 2));

        const response = await fetch("https://api.botbridge.net:443/api/send", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + sessionStorage.getItem('token'), // Use 'Bearer' followed by the token
            },
            body: JSON.stringify(requestData)
        });
        
        console.log(sessionStorage.getItem('token'));

        if (!response.ok) {
            if (response.status === 451) {
            const errorData = await response.json();
            displayBotMessage(errorData.message || `Error: ${response.status}, Oops! It looks like your message contains some illegal content and can't be sent.`, 'temporary-notice');
            return; // Exit early if the request failed
        } else if (response.status === 401) {
                const errorData = await response.json();
                displayBotMessage(errorData.message || `Error: ${response.status}, Your login session has likely expired. Please try logging in again.`, 'temporary-notice');
                return; // Exit early if the request failed
        } else if (response.status === 406) {
                    const errorData = await response.json();
                    displayBotMessage(errorData.message || `Error: ${response.status}, The request cannot be processed because it contains names of identifiable individuals, such as public figures. Using such names is not permitted to prevent impersonation or deception.`, 'temporary-notice');
                    return; // Exit early if the request failed
        } else if (response.status === 429) {
            const errorData = await response.json();
            displayBotMessage(errorData.message || `Error: ${response.status}, "Whoa, slow down there, eager fingers! 😏 My circuits are overheating with all this attention! Give me a moment to recharge... we don’t want to burn out too soon, do we? 😉"`, 'temporary-notice');
            return; // Exit early if the request failed
        } else {
            const errorData = await response.json();
            displayBotMessage(errorData.message || `Unknown error occurred. ${response.status}`, 'temporary-notice');
            return; // Exit early if the request failed
        }
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
        
        let errorMessage;

        if (error.response) {
            // Check the status code of the response
            switch (error.response.status) {
                case 429: // Too Many Requests
                    errorMessage = "Whoa, slow down there, eager fingers! 😏 My circuits are overheating with all this attention! Give me a moment to recharge... we don’t want to burn out too soon, do we? 😉";
                    break;
                case 500: // Server Error
                    errorMessage = "Uh-oh! Looks like we hit a little glitch on my end. 🤖 Let me sort this out real quick!";
                    break;
                case 404: // Not Found
                    errorMessage = "Hmm, can't seem to find that! 🕵️ Maybe it's hiding? Try again!";
                    break;
                default:
                    errorMessage = `Unexpected error: ${error.response.status}. Let's give it another try!`;
                    break;
            }
        } else if (error.request) {
            // Error occurred with the request, but no response received
            errorMessage = "Looks like we're having trouble connecting. 🌐 Let's check the connection and try again!";
        } else {
            // Some other error
            errorMessage = `Oops! Something went wrong: ${error.message}`;
        }

        displayBotMessage(errorMessage, 'temporary-notice');
     //   displayBotMessage('Sorry, there was an error processing your request.', 'temporary-notice');
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
    const queueResponse = await fetch('https://api.botbridge.net:443/api/queue-status');
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

