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
            document.getElementById('user-name').value = userID;
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
            displayMessage(characterData.greeting, 'bot', true); // Display greeting as bot message
        })
        .catch(error => {
            console.error('Error fetching character data:', error);
        });
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
    prescence_penalty: 0.15, //Slightly encourge new topics
    frequency_penalty: 0.05, //penalty for repetition
    repetitionPenalty: 1.15,
    systemPrompt: "Write {{char}}'s next response in a fictional role-play between {{char}} and {{user}}.",
    negativePrompt: "Do not talk about sexual topics or explicit content.",
    context: "",
    enablePreload: false, // Default to false if not provided
    sessionId: 1,
};

const isFirstMessage = true; 

async function sendMessage() {
    document.getElementById('advanced-debugging').value = currentBotMessageElement.innerHTML;
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
   // if (!message) return;
    //if (!isResend) {
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
  //  }

    lastBotMsg = lastBotMsg || settings.greeting;

    // Define the system message
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
        const requestData = {
                model: "nephra_v1.0.Q4_K_M.gguf",
                messages: [systemPrompt, ...messages],
                stream: true, // Enables streaming responses
            

                // The combined prompt for the AI
               // prompt: `User: ${message} \nAssistant: ${messagedataimportance.messagehistorytrimmed} ${lastBotMsg}`,
            
                // AI parameters
                max_tokens: settings.maxTokens,
                temperature: settings.temperature,
                min_p: settings.minP,
                top_k: settings.topK,
                top_p: settings.topP,
            };            
        
       // displayMessage(systemPrompt, 'system');
        console.log('Request Data:', JSON.stringify(requestData, null, 2));
        
        // const response = await fetch("https://api.botbridge.net/api/send", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //         'Authorization': 'Bearer ' + sessionStorage.getItem('token'), // Use 'Bearer' followed by the token
        //     },
        //     body: JSON.stringify(requestData)
        // });
        
        const response = await fetch("https://period-ann-patch-ram.trycloudflare.com/v1/chat/completions", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // Add any other headers that were in axios
            },
            body: JSON.stringify(requestData)
        });
        
        // const response = await fetch("https://bathroom-audit-symphony-que.trycloudflare.com/v1/chat/completions", {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json',
        //      //   'Authorization': 'Bearer ' + sessionStorage.getItem('token'), // Use 'Bearer' followed by the token
        //     },
            
        //     body: JSON.stringify(requestData)
        // });
        
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
            //console.log(chunk);

           // const matches = chunk.match(/"content":\s*\[\{"type":"text","text":"([^"]*)"\}\]/);
           const matches = chunk.match(/"content":"([^"]*)"/); 
           if (matches && matches[1]) {
                const content = matches[1];
                result += content;
                clearCurrentBotMessage();
                displayMessage(result, 'bot', false);
            }
        }

        if (result) {
            // Append the final message to the botMessages array
            const botMessage = {
                role: 'assistant',
                content: [{ type: 'text', text: result }]
            };
           // messages.push(botMessage);

            // Display the final bot message in the chat
            clearCurrentBotMessage();
            displayMessage(result, 'bot', true);
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
        displayMessage(botMessage, 'bot', true);
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
        displayMessage(greeting, 'bot');
    }
}

function sendGreeting() {
    messagessent = 0;
    const greeting = settings.greeting;
    if (greeting) {
        displayMessage(greeting, 'bot', true);
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

let userName = '{{user}}';
let currentBotMessageElement = null;
let botMessages = []; // Array to store bot messages
let currentBotMessageIndex = -1; // Index to track current bot message
let lastBotMsg = null;

let messages = []; // Array to store messages

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
        .replace(/{{user}}/g, userName); // Replace {{user}} with the actual user name

    // Prepare message object in the desired format
    const messageObject = {
        role: sender === 'bot' ? 'assistant' : sender === 'system' ? 'system' : 'user', // 'assistant' for bot, 'system' for system messages, 'user' otherwise
        content: [{ type: 'text', text: content }]
    };
    
    // Add the message object to the messages array
    if (sender === 'user') {
        messages.push(messageObject);
        console.log('Messages array:', messages); // Debugging to view the array
    }

    // Add the message object to the messages array
    if (sender === 'system') {
        messages.push(messageObject);
        console.log('Messages array:', messages); // Debugging to view the array
    }

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
            messages.push(messageObject);
            console.log('Messages array:', messages); // Debugging to view the array
            //botMessages.push(currentBotMessageElement.innerHTML);
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

    // Scroll to the bottom of the chat container
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

// Additional functions remain the same

function regenerateMessage() {
    if (lastUserMessage) {
        settings.context = settings.context.replace(lastBotMessage, '').trim();

        clearCurrentBotMessage();
        isResend = true;
        document.getElementById('user-input').value = lastUserMessage;

        sendMessage(); // Resend the last user message
    } else {
        displayMessage('No previous user message found to regenerate.', 'bot');
    }
}

function navigateBotMessages(direction) {
    if (currentBotMessageIndex === -1) return;

    const newIndex = currentBotMessageIndex + direction;
    if (newIndex >= 0 && newIndex < botMessages.length) {
        currentBotMessageIndex = newIndex;
        const content = botMessages[currentBotMessageIndex];
        currentBotMessageElement.innerHTML = content;

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

document.addEventListener('DOMContentLoaded', () => {
    checkAPIStatus();
    populateCharacterSettings();
});

