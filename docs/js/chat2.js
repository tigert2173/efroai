const chatContainer = document.getElementById('chat-container');

// Function to get a cookie by name
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

const userID = getCookie('userID');

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
        const response = await fetch('https://botbridge.net/api/server-status');
        const data = await response.json();

        const totalServers = data.listedCount;
        const operationalServers = data.notDownCount;

        console.log(`Total Servers: ${totalServers}, Operational Servers: ${operationalServers}`);

        const operationalPercentage = (operationalServers / totalServers) * 100;
        const speedIndicator = document.getElementById('speed-indicator');
        speedIndicator.style.width = `${operationalPercentage}%`;

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


function loadCharacter(charName, listItem) {
    clearCurrentBotMessage();

    const characterData = sessionStorage.getItem('chatbotCharacter_' + charName);
    if (characterData) {
        settings = JSON.parse(characterData);
        // document.getElementById('persona').value = settings.persona;
        // document.getElementById('context').value = settings.context;
        // document.getElementById('greeting').value = settings.greeting;
        document.getElementById('temperature').value = settings.temperature;
        document.getElementById('model').value = settings.model;
        highlightCharacter(listItem);
        sendGreeting(); // Send greeting message on character load
    } else {
        alert('Character not found.');
    }
}

//Shortwave Config
let settings = {
    charname: '',
    persona: '',
    context: '',
    scenario: '',
    greeting: '',
    exampledialogue: '',
    temperature: 1.10,
    maxTokens: 256,
    model: '',
    top_p: 0.64, //Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P.
    typical_p: 1, 
    min_p: 0.00, //Sets a minimum base probability threshold for token selection.
    top_k: 33, //Limit the next token selection to the K most probable tokens.
    prescence_penalty: 0.00, //Slightly encourge new topics
    frequency_penalty: 0.00, //penalty for repetition aka avoid repeating words
    repeat_penalty: 1.07,
    systemPrompt: "Write {{char}}'s next response in a fictional role-play between {{char}} and {{user}}.",
    negativePrompt: "Do not talk about sexual topics or explicit content.",
    context: "",
    enablePreload: false, // Default to false if not provided
    sessionId: 1,
};

function populateCharacterSettings() {
    // Retrieve the character data from sessionStorage
    const selectedCharacterId = sessionStorage.getItem('selectedCharacterId');
    const characterUploader = sessionStorage.getItem('characterUploader');
    const token = localStorage.getItem('token'); // Retrieve the token

    // Fetch the character data from the backend
    const url = `https://74.208.46.27:3000/api/chat/${characterUploader}/${selectedCharacterId}`;
    
    fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `${token}`, // Add the auth token here
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(character => {
        // Define the character object
        const characterData = {
            charname: character.name || '',
            uploader: character.uploader || '',
            persona: character.persona || '',
            context: character.context || '',
            scenario: character.scenario || '',
            greeting: character.greeting || '',
            exampledialogue: character.exampledialogue || ''
        };

        // Populate each field with the character's data
        document.getElementById('user-name').value = userID || "{{user}}";
        // Uncomment the following lines to populate the rest of the fields
        // document.getElementById('persona').value = characterData.persona;
        // document.getElementById('context').value = characterData.context;
        // document.getElementById('scenario').value = characterData.scenario;
        // document.getElementById('greeting').value = characterData.greeting;
        // document.getElementById('exampledialogue').value = characterData.exampledialogue;

        // Update settings
        settings.charname = characterData.charname;
        settings.persona = characterData.persona;
        settings.context = characterData.context;
        settings.greeting = characterData.greeting;
        settings.scenario = characterData.scenario;
        settings.exampledialogue = characterData.exampledialogue;

        // Display the greeting as a bot message
        displayMessage(characterData.greeting, 'assistant', true); // Display greeting as bot message
    })
    .catch(error => {
        console.error('Error fetching character data:', error);
    });
}


function updateSettings() {
    checkAPIStatus();
    //processMessageDataImportance();
    // settings.persona = document.getElementById('persona').value;
    // settings.context = document.getElementById('context').value;
    // settings.greeting = document.getElementById('greeting').value;
    settings.temperature = parseFloat(document.getElementById('temperature').value);
    settings.model = document.getElementById('model').value;
    settings.maxTokens = document.getElementById('SettingsMaxTokensSlider').value;

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

// Function to clear the content of the current bot message element
function clearAllMessages() {
    chatContainer.innerHTML = '';
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

// //Llama 3 Default Config
// let settings = {
//     persona: '',
//     context: '',
//     scenario: '',
//     greeting: '',
//     exampledialogue: '',
//     temperature: 1.22,
//     model: '',
//     maxTokens: 256,
//     topP: 0.8, //Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P.
//     typical_p: 1, 
//     minP: 0.1, //Sets a minimum base probability threshold for token selection.
//     topK: 40, //Limit the next token selection to the K most probable tokens.
//     prescence_penalty: 0.00, //Slightly encourge new topics
//     frequency_penalty: 0.00, //penalty for repetition aka avoid repeating words
//     repeat_penalty: 1.08,
//     systemPrompt: "Write {{char}}'s next response in a fictional role-play between {{char}} and {{user}}.",
//     negativePrompt: "Do not talk about sexual topics or explicit content.",
//     context: "",
//     enablePreload: false, // Default to false if not provided
//     sessionId: 1,
// };

   // Function to update settings based on selected option
    function updateSettingParameters(option) {
        switch (option) {       
        case 'Ethereal Winds':
            // Shortwave config
            settings.temperature = 1.10;
            settings.top_p = 0.64;
            settings.top_k = 33;
            settings.min_p = 0.0;
            settings.prescence_penalty = 0.00;
            settings.frequency_penalty = 0.00;
            settings.repeat_penalty = 1.09;
            // Add any additional settings updates here
            break;
    
        case 'AetherFume':
            // Shortwave config
            settings.temperature = 1.10;
            settings.top_p = 0.64;
            settings.top_k = 33;
            settings.min_p = 0.0;
            settings.prescence_penalty = 0.15;
            settings.frequency_penalty = 0.05;
            settings.repeat_penalty = 1.07;
            // Add any additional settings updates here
            break;

        case 'Nebula Drift':
            // Shortwave config
            settings.temperature = 1.15;          // Slightly higher temperature for more creativity
            settings.top_p = 0.7;                 // A bit more randomness in token selection
            settings.top_k = 40;                  // Wider selection for token choices
            settings.min_p = 0.01;                // Allow some rare tokens for variety
            settings.prescence_penalty = 0.10;    // Mild penalty to encourage novelty
            settings.frequency_penalty = 0.05;    // Minimal frequency penalty to avoid too much repetition
            settings.repeat_penalty = 1.12;       // Slightly higher repeat penalty to avoid excessive looping
            // Add any additional settings updates here
            break;

        case 'Chaos Catalyst':
            // Disruptive config to force variation
            settings.temperature = 0.20; // High randomness
            settings.top_p = 0.85; // Broadens the range of token choices
            settings.top_k = 50; // Allows more token options for variety
            settings.min_p = 0.0; // Keep zero to avoid limiting
            settings.prescence_penalty = 1.40; // Forces the model to consider new topics
            settings.frequency_penalty = 0.20; // Encourages less frequent tokens
            settings.repeat_penalty = 1.5; // Strong penalty to prevent repetition
            // Add any additional settings updates here
            break;
            
            case 'Llama 3 Default':
                // Llama 3 Default config
                settings.temperature = 1.22;
                settings.top_p = 0.80;
                settings.top_k = 40;
                settings.repeat_penalty = 1.08;
                settings.min_p = 0.1;
                settings.prescence_penalty = 0.00;
                settings.frequency_penalty = 0.00;
                // Add any additional settings updates here
                break;

            case 'Creative Boost':
                // Creative Boost config
                settings.temperature = 1.53;
                settings.top_p = 0.5;
                settings.top_k = 0;
                settings.repeat_penalty = 1.07;
                settings.min_p = 0.0;
                settings.prescence_penalty = 0.00;
                settings.frequency_penalty = 0.00;
                // Add any additional settings updates here
                break;

            case 'Yodayo Default':
                // Yodayo Default config
                settings.temperature = 1.31;
                settings.top_p = 0.85;
                settings.top_k = 49;
                settings.repeat_penalty = 1.15;
                settings.min_p = 0.0;
                settings.prescence_penalty = 0.00;
                settings.frequency_penalty = 0.00;
                // Add any additional settings updates here
                break;

            case 'Clarity Forge':
                // Clarity Forge config
                settings.temperature = 1.30;
                settings.top_p = 1.0;
                settings.top_k = 50;
                settings.repeat_penalty = 1.10;
                settings.min_p = 0.1;
                settings.prescence_penalty = 0.00;
                settings.frequency_penalty = 0.00;
                // Add any additional settings updates here
                break;

            case 'Divine Intellect':
                // Divine Intellect config
                settings.temperature = 1.31;
                settings.top_p = 0.14;
                settings.top_k = 49;
                settings.repeat_penalty = 1.17;
                settings.min_p = 0.0;
                settings.prescence_penalty = 0.00;
                settings.frequency_penalty = 0.00;
                // Add any additional settings updates here
                break;

            case 'Fantastic':
                // Fantastic config
                settings.temperature = 1.75;
                settings.top_p = 1.00;
                settings.top_k = 0;
                settings.repeat_penalty = 1.05;
                settings.min_p = 0.0;
                settings.prescence_penalty = 0.00;
                settings.frequency_penalty = 0.00;
                // Add any additional settings updates here
                break;
    
                
            case 'Basic':
                // Basic config
                settings.temperature = 0.44;
                settings.top_p = 1.00;
                settings.top_k = 0;
                settings.repeat_penalty = 1.15;
                settings.min_p = 0.0;
                settings.prescence_penalty = 0.00;
                settings.frequency_penalty = 0.00;
                // Add any additional settings updates here
                break;
    
                     
        case 'LLama Precise':
            // LLama Precise config
            settings.temperature = 0.70;
            settings.top_p = 0.10;
            settings.top_k = 40;
            settings.repeat_penalty = 1.18;
            settings.min_p = 0.0;
            settings.prescence_penalty = 0.00;
            settings.frequency_penalty = 0.00;
            // Add any additional settings updates here
            break;

        case 'Midnight Enigma':
            // Midnight Enigma config
            settings.temperature = 0.98;
            settings.top_p = 0.37;
            settings.top_k = 0;
            settings.repeat_penalty = 1.18;
            settings.min_p = 0.0;
            settings.prescence_penalty = 0.00;
            settings.frequency_penalty = 0.00;
            // Add any additional settings updates here
            break;

        case 'Shortwave':
            // Shortwave config
            settings.temperature = 1.53;
            settings.top_p = 0.64;
            settings.top_k = 33;
            settings.repeat_penalty = 1.07;
            settings.min_p = 0.0;
            settings.prescence_penalty = 0.00;
            settings.frequency_penalty = 0.00;
            // Add any additional settings updates here
            break;

        case 'Star Chat':
            // Star Chat config
            settings.temperature = 0.02;
            settings.top_p = 0.95;
            settings.top_k = 50;
            settings.repeat_penalty = 1.00;
            settings.min_p = 0.0;
            settings.prescence_penalty = 0.00;
            settings.frequency_penalty = 0.00;
            // Add any additional settings updates here
            break;

        case 'Yara':
            // Yara config
            settings.temperature = 0.82;
            settings.top_p = 0.21;
            settings.top_k = 72;
            settings.repeat_penalty = 1.19;
            settings.min_p = 0.0;
            settings.prescence_penalty = 0.00;
            settings.frequency_penalty = 0.00;
            // Add any additional settings updates here
            break;

            // Add cases for other options if needed
            
            
            default:
                console.log("No matching config found.");
                break;
        }
        console.log('Updated settings:', settings);
    }

    // Add event listener to detect changes in the <select> element
    document.getElementById('systemParameters').addEventListener('change', function() {
        const selectedOption = this.value;
        updateSettingParameters(selectedOption);
    });

// Function to update systemPrompt in settings
function updateSystemPrompt() {
    const selectElement = document.getElementById('systemPrompt');
    settings.systemPrompt = selectElement.value;
    console.log("Updated systemPrompt:", settings.systemPrompt); // Optional: for debugging
}

// // Set the initial value for systemPrompt
// document.getElementById('systemPrompt').value = settings.systemPrompt;

// Add event listener for change events on the select element
document.getElementById('systemPrompt').addEventListener('change', updateSystemPrompt);
// let settings = {
//     persona: '',
//     context: '',
//     scenario: '',
//     greeting: '',
//     exampledialogue: '',
//     temperature: 1.05,
//     model: '',
//     maxTokens: 256,
//     topP: 0.85, //Limit the next token selection to a subset of tokens with a cumulative probability above a threshold P.
//     typical_p: 1, 
//     minP: 0.00, //Sets a minimum base probability threshold for token selection.
//     topK: 30, //Limit the next token selection to the K most probable tokens.
//     prescence_penalty: 0.10, //Slightly encourge new topics
//     frequency_penalty: 0.00, //penalty for repetition aka avoid repeating words
//     repeat_penalty: 1.15,
//     systemPrompt: "Write {{char}}'s next response in a fictional role-play between {{char}} and {{user}}.",
//     negativePrompt: "Do not talk about sexual topics or explicit content.",
//     context: "",
//     enablePreload: false, // Default to false if not provided
//     sessionId: 1,
// };

const isFirstMessage = true; 
let isResend = false;
async function sendMessage() {
    document.getElementById('advanced-debugging').value = currentBotMessageElement.innerHTML;
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
   // if (!message) return;
    if (!isResend) {
       // processMessageDataImportance();
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

    //Define the system message
    const systemPrompt = {
        role: "system",
        content: `${settings.systemPrompt}
        Persona: ${settings.persona}
        Scenario: ${settings.scenario}
        ${settings.context ? `Context: ${settings.context}` : ''}
        ${settings.negativePrompt ? `Negative Prompt: ${settings.negativePrompt}` : ''}
        `,
    };
    

    try {    
        await updateSettings();
        // Construct the conversation context
        // conversationContext.push(`User: ${settings.message}`); // Append user message

        // // Limit the context size
        // if (conversationContext.length > 4096) {
        //     conversationContext.shift(); // Remove the oldest message
        // }

        // Create the full prompt for the bot
        //const fullPrompt = `${settings.systemPrompt}\n${conversationContext.join('\n')}\nAssistant: ${settings.lastBotMsg || ''}`;
        console.log("Messages: " + JSON.stringify(messages));
        const requestData = {
                model: "nephra_v1.0.Q4_K_M.gguf",
                n_predict: parseInt(settings.maxTokens, 10),
                messages: [systemPrompt, ...messages],
                stream: true, // Enables streaming responses
            

                // The combined prompt for the AI
               // prompt: `User: ${message} \nAssistant: ${messagedataimportance.messagehistorytrimmed} ${lastBotMsg}`,
            
                // AI parameters
               // max_tokens: settings.maxTokens,
                temperature: settings.temperature,
                prescence_penalty: settings.prescence_penalty,
                frequency_penalty: settings.frequency_penalty,
                repeat_penalty: settings.repeat_penalty,
                min_p: settings.min_p,
                top_k: settings.top_k,
                top_p: settings.top_p,
                t_max_predict_ms: 300000, //timeout after 5 minutes
            };            
        
       // displayMessage(systemPrompt, 'system');
        console.log('Request Data:', JSON.stringify(requestData, null, 2));
        
        const response = await fetch("https://api.botbridge.net/api/send", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token'), // Use 'Bearer' followed by the token
            },
            body: JSON.stringify(requestData)
        });
        
        // const response = await fetch("https://period-ann-patch-ram.trycloudflare.com/v1/chat/completions", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         // Add any other headers that were in axios
        //     },
        //     body: JSON.stringify(requestData)
        // });
        
        // const response = await fetch("https://bathroom-audit-symphony-que.trycloudflare.com/v1/chat/completions", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //      //   'Authorization': 'Bearer ' + localStorage.getItem('token'), // Use 'Bearer' followed by the token
        //     },
            
        //     body: JSON.stringify(requestData)
        // });
        
        console.log(localStorage.getItem('token'));

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
        } else if (response.status === 400) {
                const errorData = await response.json();
                displayBotMessage(errorData.message || `Error: ${response.status}, this usually means you are not logged in.`, 'temporary-notice');
                return; // Exit early if the request failed
        } else if (response.status === 429) {
            const errorData = await response.json();
           // displayBotMessage(errorData.message || `Whoa there! It seems you're trying to send messages faster than our circuits can handle! 🏎️💨 Slow down, or our fetish AI might just short-circuit from excitement! 😅`, 'temporary-notice');
            displayBotMessage(`Whoa there! It seems you're trying to send messages faster than our circuits can handle! 🏎️💨 Slow down, or our AI might just short-circuit from excitement! 😅`, 'temporary-notice');
            //displayBotMessage(errorData.message || `Whoa there! It looks like you're trying to send messages faster than our circuits can handle. Even our fetish AI needs a moment to catch its breath! Slow down, or we might just short-circuit! 😏`, 'temporary-notice');
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
        let bufferedData = '';
    
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
    
            // Decode the current chunk
            const chunk = decoder.decode(value, { stream: true });
            bufferedData += chunk; // Accumulate the data in the buffer
    
            // Split the buffered data into potential complete JSON objects
            let lines = bufferedData.split('\n');
    
            // Process each line
            for (let line of lines) {
                // Check if the line contains JSON data
                if (line.startsWith('data: ')) {
                    const jsonString = line.substring(6).trim(); // Remove the 'data: ' prefix
    
                    // Skip the '[DONE]' message
                    if (jsonString === '[DONE]') {
                        continue; // Skip this line
                    }
    
                    try {
                        const jsonResponse = JSON.parse(jsonString);
                        if (jsonResponse.choices && jsonResponse.choices.length > 0) {
                            const content = jsonResponse.choices[0].delta.content;
                            if (content) { // Only append non-empty content
                                result += content;
                                clearCurrentBotMessage();
                                displayMessage(result, 'assistant', false);
                            }
                        }
                    } catch (error) {
                        console.error('Failed to parse JSON:', error);
                    }
                }
            }
    
            // Keep any leftover buffered data
            // This could happen if the last line doesn't end with a newline
            bufferedData = bufferedData.endsWith('\n') ? '' : lines.pop(); // Store any partial data
        }
    
        // Final display outside the loop
        if (result) {
            clearCurrentBotMessage();
            displayMessage(result, 'assistant', true);
        }    
    } else {
        const data = await response.json();
        const botMessage = data.choices[0].message.content;
        
        // Append the final message to the botMessages array
        const botMessageObject = {
            role: 'assistant',
            content: [{ type: 'text', text: botMessage }]
        };
        // messages.push(botMessageObject);

        // Display the final bot message in the chat
        displayMessage(botMessage, 'assistant', true);
    }
} catch (error) {
    console.error('Error:', error);
    displayMessage('Sorry, there was an error processing your request.', 'temporary-notice');
} finally {
    isResend = false;
}
}


function usernameupdated () {

    if ( messagessent == 0) {
        currentBotMessageElement.innerHTML = '';
        const greeting = settings.greeting;
        displayMessage(greeting, 'assistant');
    }
}

function sendGreeting() {
    messagessent = 0;
    const greeting = settings.greeting;
    if (greeting) {
        displayMessage(greeting, 'assistant', true);
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

function regenerateMessage() {
    isResend = true;
    const lastAssistantMessage = getLastAssistantMessage();
    
    if (lastAssistantMessage) {
        // Find the last user message
        let lastUserMessage = null;
        for (let i = messages.length - 1; i >= 0; i--) {
            if (messages[i].role === 'user') {
                lastUserMessage = messages[i].content[0].text; // Get the last user message
                break; // Exit once we find the last user message
            }
        }

        if (lastUserMessage) {
            // Update the user input with the last user message
            document.getElementById('user-input').value = lastUserMessage;

            // Clear current bot message content to regenerate
            currentBotMessageElement.innerHTML = ''; // Clear current bot message
            
            // remove the last assistant message if needed
            if (messages.length > 0) {
                messages.pop(); // Remove the last message from the array
            }

            // Send the last user message again
            sendMessage(); // Ensure this function is defined to handle sending the message
        } else {
            displayMessage('No previous user message found to regenerate.', 'assistant');
        }
    } else {
        displayMessage('No previous assistant message found to regenerate.', 'assistant');
    }
}


// Update this function to get the last assistant message correctly
function getLastAssistantMessage() {
    // Find the last message in the messages array with the role 'assistant'
    for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].role === 'assistant') {
            return messages[i];
        }
    }
    return null; // Return null if no assistant message is found
}
let isSnowflakeActive = false; // Flag to track if snowflake effect is active
let isSantaActive = false; // Flag to track if Santa image effect is active
let isGiftBoxActive = false; // Flag to track if gift box effect is active

function showSnowflakes() {
    if (isSnowflakeActive) return; // Prevent triggering if snowflake effect is active
    isSnowflakeActive = true; // Set flag to active

    // Function to create a snowflake at a random position
    function createSnowflake() {
        const snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        snowflake.textContent = '❄️';
        
        // Randomly decide whether to position the snowflake on the left or right
        const isLeftSide = Math.random() < 0.5; // 50% chance for left side
    
        if (isLeftSide) {
            // Random horizontal position favoring the left 25% of the viewport width
            const randomX = Math.random() * 25; // Generate a value between 0% and 25%
            snowflake.style.left = `${randomX}%`; // Position using the left property
        } else {
            // Random horizontal position favoring the right 25% of the viewport width
            const randomX = Math.random() * 25; // Generate a value between 0% and 25%
            snowflake.style.right = `${randomX}%`; // Position using the right property
        }
    
        // Random size between 10px and 50px
        const randomSize = Math.random() * 40 + 20;
        snowflake.style.fontSize = `${randomSize}px`;
        
        // Add the snowflake to the document body
        document.body.appendChild(snowflake);
        
        // Animate snowflake falling from the top
        snowflake.style.animation = `fall ${randomSize / 10 + 2}s linear`; // Adjust fall speed based on size
        
        // Remove the snowflake after the animation completes
        setTimeout(() => snowflake.remove(), (randomSize / 10 + 2) * 1000);
    }
    

    // Function to generate snowflakes over a period of time
    function generateSnowflakes() {
        const interval = Math.random() * 1000 + 500; // Random interval between 500ms and 1500ms
        createSnowflake();
        
        // Keep generating snowflakes at random intervals
        setTimeout(generateSnowflakes, interval);
    }

    generateSnowflakes();

    // Deactivate effect after 10 seconds
    setTimeout(() => {
        isSnowflakeActive = false;
    }, 30000);
}

function showSantaImage() {
    if (isSantaActive) return; // Prevent triggering if Santa effect is active
    isSantaActive = true; // Set flag to active
    playSantaVoice();
    const santaImage = document.createElement('img');
    santaImage.src = 'santa.png';
    santaImage.classList.add('santa-image');
    document.body.appendChild(santaImage);
    
    // Remove the Santa image after a few seconds
    setTimeout(() => {
        santaImage.remove();
        isSantaActive = false; // Deactivate the Santa effect
    }, 30000);
}

function showGiftBoxes() {
    if (isGiftBoxActive) return; // Prevent triggering if gift box effect is active
    isGiftBoxActive = true; // Set flag to active

    const giftBox = document.createElement('div');
    giftBox.classList.add('gift-box');
    giftBox.textContent = '🎁';
    document.body.appendChild(giftBox);
    
    // Remove the gift box after animation
    setTimeout(() => {
        giftBox.remove();
        isGiftBoxActive = false; // Deactivate the gift box effect
    }, 5000);
}

function triggerSpecialEffect(effect) {
    if (effect === 'merry-christmas') {
        document.getElementById('christmas-music').play();
        showSnowflakes();
    } else if (effect === 'santa') {
        showSantaImage();
    } else if (effect === 'snow') {
        showSnowflakes();
    } else if (effect === 'gifts') {
        showGiftBoxes();
    }
}

// Example of playing sound when 'Santa' is mentioned
function playSantaVoice() {
    document.getElementById('santa-voice').play();
}

// Define showSnowflakes, showSantaImage, showGiftBoxes, etc.


let userName = '{{user}}';
let charName = '{{char}}';
let lastBotMsg = null;

let messages = []; // Array to store messages
let botMessages = []; // Array to store bot messages
let currentBotMessageElement = null;
let currentBotMessageIndex = -1; // Index for tracking the current bot message

function displayMessage(content, sender, isFinal = false, isLoading = false) {
    let userName = document.getElementById('user-name').value.trim();
    let charName = settings.charname || "{{char}}";
    if (!userName) { userName = "{{user}}"; }

    const sanitizedContent = content
        // .replace(/([.!?])(?!\.\.\.)(\s*)/g, "$1 ") // Ensure single space after . ? !
        .replace(/\\n/g, '<br>') // Convert literal \n to <br>
        // .replace(/\\(?!n)/g, '') // Remove backslashes not followed by n
        .replace(/\n/g, '<br>') // Convert newline characters to <br> (if needed)
        .replace(/_*_*(.*?)\_\_/g, '<u>$1</u>') // Convert __text__ to <u>text</u>
        .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>') // Convert **text** to <b>text</b>
        .replace(/\*(.*?)\*/g, '<i>$1</i>') // Convert *text* to <i>text</i>
        .replace(/```([\s\S]*?)```/g, '<code>$1</code>') // Block code with triple backticks
        .replace(/`([^`]+)`/g, '<codelight>$1</codelight>') // monospace with single backticks
        .replace(/{{user}}|{user}/g, userName) // Replace both {{user}} and {user} with the actual user name
        .replace(/{{char}}|{char}/g, charName) // Replace both {{user}} and {user} with the actual user name
 // Add custom Christmas formatting:
 .replace(/Merry Christmas/gi, '<span class="christmas-bold">🎅 Merry Christmas! 🎄</span>') // Special Christmas greeting
 .replace(/Santa/gi, '<span class="christmas-font">🎅 Santa</span>') // Special Santa formatting
 .replace(/gifts/gi, '<span class="christmas-gifts">🎁 gifts 🎁</span>') // Special gifts formatting
//  .replace(/snow/gi, '<span class="snowflake">❄️ snow ❄️</span>') // Snowflakes for the word "snow"
      // Add colorful text formatting for specific syntax |color|text|color|
    .replace(/\|(\w+)\|([^|]+)\|\1\|/g, (match, color, text) => {
        // Return the text wrapped in a span with the corresponding color
        return `<span style="color:${color};">${text}</span>`;
    });
   
      // Check for Christmas keywords to trigger special effects
   if (content.match(/Merry Christmas/i)) {
    triggerSpecialEffect('merry-christmas');
} else if (content.match(/Santa/i)) {
    triggerSpecialEffect('santa');
} else if (content.match(/gifts/i)) {
    triggerSpecialEffect('gifts');
} else if (content.match(/snow/i)) {
    triggerSpecialEffect('snow');
}
 // Prepare message object in the desired format
    const messageObject = {
        role: sender,
        content: [{ type: 'text', text: content }]
    };

    if (isLoading) {
        currentBotMessageElement = '';
    }

    if (sender === 'assistant') {
        // Create or reuse the current bot message element
        if (!currentBotMessageElement) {
            currentBotMessageElement = document.createElement('div');
            currentBotMessageElement.className = `message ${sender}`;
            chatContainer.appendChild(currentBotMessageElement);
        }

        // Update the content of the existing bot message element
        if (currentBotMessageElement) {
            currentBotMessageElement.innerHTML =  `
        <span class="message-content">${sanitizedContent}</span>
        <button class="edit-btn" onclick="enableEditMode(this, ${messages.length})">Edit</button>
        `;
        }
        // If the message is final, update the navigation header
        if (isFinal) {
            // Store bot message in the botMessages array
            botMessages.push(sanitizedContent);
            currentBotMessageIndex = botMessages.length - 1; // Update index for regeneration
            
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

            // Append message header to the chat container
            chatContainer.insertBefore(messageHeader, currentBotMessageElement);
        }

        updateArrowStates();
    } else {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.innerHTML = `
        <span class="message-content">${sanitizedContent}</span>
        <button class="edit-btn" onclick="enableEditMode(this, ${messages.length})">Edit</button>
        `;
        chatContainer.appendChild(messageElement);
    }

    if (isFinal || sender === 'user'){
        // Add the message object to the messages array
        messages.push(messageObject);
        console.log('Messages array:', messages); // Debugging to view the array
        // Update arrow states
        }
    // // Scroll to the bottom of the chat container
    // chatContainer.scrollTop = chatContainer.scrollHeight;
}

function navigateBotMessages(direction) {
    if (currentBotMessageIndex === -1) return;

    const newIndex = currentBotMessageIndex + direction;
    if (newIndex >= 0 && newIndex < botMessages.length) {
        currentBotMessageIndex = newIndex;
        const content = botMessages[currentBotMessageIndex];
        currentBotMessageElement.innerHTML = content; // Update the existing bot message element

        lastBotMsg = currentBotMessageElement.textContent || currentBotMessageElement.innerHTML;
        console.log('Updated lastBotMsg (navigated):', lastBotMsg);

        updateArrowStates();
    }
}

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

function enableEditMode(button, index) {
    const messageElement = button.parentElement; // The parent element of the button
    const messageContentElement = messageElement.querySelector('.message-content'); // Locate the content element
    const currentContent = messageContentElement.innerHTML;

    // Replace the message content with a textarea for inline editing
    messageContentElement.innerHTML = `<textarea class="edit-area" oninput="autoResize.call(this)" style="width: 100%;">${currentContent.replace(/<br>/g, '\n')}</textarea>`;
    
    // Set the initial height to match the content
    const editArea = messageContentElement.querySelector('.edit-area');
    editArea.style.height = `${editArea.scrollHeight}px`;

    // Replace the Edit button with a Save button
    button.textContent = 'Save';
    button.onclick = function() { saveEditedMessage(this, index); };

    // Focus the edit area for immediate typing
    editArea.focus();
}


function saveEditedMessage(button, index) {
    const messageElement = button.parentElement;
    const editArea = messageElement.querySelector('.edit-area');
    const newContent = editArea.value.replace(/\n/g, '<br>');

    // Update the message content in the array
    messages[index].content[0].text = newContent;
    
    // Replace the textarea with the new content and restore the Edit button
    messageElement.querySelector('.message-content').innerHTML = newContent;
    button.textContent = 'Edit';
    button.onclick = function() { enableEditMode(this, index); };

    console.log('Updated message:', messages);
}

function editMessage(index) {
    const messageToEdit = messages[index];
    const currentContent = messageToEdit.content[0].text;

    // Prompt user to edit the content (you can replace this with a more elegant popup or modal)
    const newContent = prompt("Edit your message:", currentContent);

    if (newContent !== null) {
        messageToEdit.content[0].text = newContent;
        // Update the message in the chat display
        const messageElements = document.querySelectorAll('.message');
        const messageElement = messageElements[index];
        messageElement.innerHTML = `
            ${newContent.replace(/\\n/g, '<br>').replace(/\n/g, '<br>')}
            <button class="edit-btn" onclick="editMessage(${index})">Edit</button>
        `;
        console.log('Updated message:', messages);
    }
}

function autoResize() {
    // Reset the height to shrink it before measuring
    this.style.height = 'auto'; 
    // Set the height to the scrollHeight to expand it to fit content
    this.style.height = `${this.scrollHeight}px`; 
}

async function updateQueueCounter() {
    // Fetch the number of jobs in the queue
    const queueCount = document.querySelector('#queue-count');
    const queueResponse = await fetch('https://api.botbridge.net:443/queue-status');
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

document.addEventListener('DOMContentLoaded', () => {
    checkAPIStatus();
    populateCharacterSettings();
});
