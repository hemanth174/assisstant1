document.addEventListener('DOMContentLoaded', () => {
    // --- Initial Setup ---
    const startBtn = document.getElementById('start-btn');
    const statusText = document.getElementById('status-text');
    const userCommandText = document.getElementById('user-command');
    const giriResponseText = document.getElementById('giri-response');

    console.log("Script loaded. All elements found.");

    // --- Browser Feature Checks ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        statusText.textContent = "Error: Speech Recognition is not supported by this browser.";
        startBtn.disabled = true;
        return;
    }

    if (!window.speechSynthesis) {
        statusText.textContent = "Error: Speech Synthesis is not supported by this browser.";
        startBtn.disabled = true;
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-in'; // Set language to English (India)
    recognition.interimResults = false;

    
const synth = window.speechSynthesis;

function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

function startListening() {
    try {
        recognition.start();
        console.log("Listening started.");
        statusText.textContent = "Listening...";

        // 🔊 AI introduces itself only the first time
        if (!hasIntroduced) {
            speak("Hello! I am your voice assistant. I am now listening.");
            hasIntroduced = true;
        }
    } catch (error) {
        console.error("Error starting recognition:", error);
        statusText.textContent = "Error: Could not start listening.";
    }
}

function stopListening() {
    try {
        recognition.stop();
        console.log("Listening stopped.");
        statusText.textContent = "Stopped.";
    } catch (error) {
        console.error("Error stopping recognition:", error);
        statusText.textContent = "Error: Could not stop listening.";
    }
}

// 1. Button click
startBtn.addEventListener('click', () => {
    console.log("Button clicked.");
    startListening();
});

// 2. Keyboard shortcuts
document.addEventListener('keydown', (event) => {
    if (event.ctrlKey && event.key.toLowerCase() === 's') {
        event.preventDefault();
        startListening();
    }

    if (event.ctrlKey && event.key.toLowerCase() === 'e') {
        event.preventDefault();
        stopListening();
    }
});

    // --- Speech Recognition Events ---
    recognition.onstart = () => {
        console.log("Recognition started.");
        statusText.textContent = "🎧 Listening...";
        startBtn.classList.add('listening');
    };

    recognition.onend = () => {
        console.log("Recognition ended.");
        statusText.textContent = "Click the button and speak your command";
        startBtn.classList.remove('listening');
    };

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        console.log("Command recognized:", command);
        userCommandText.textContent = `🗣️ You said: ${command}`;
        sendCommandToServer(command);
    };

    recognition.onerror = (event) => {
        console.error("Recognition error:", event.error);
        giriResponseText.textContent = `Error: ${event.error}. Please try again.`;
    };

    // --- Server Communication and Speaking ---
    async function sendCommandToServer(command) {
        console.log("Sending command to server:", command);
        statusText.textContent = "Processing...";
        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command }),
            });
            const data = await response.json();
            console.log("Received response from server:", data);

            talk(data.text);

            if (data.action_url) {
                console.log("Opening URL in new tab:", data.action_url);
                window.open(data.action_url, '_blank');
            }
        } catch (error) {
            console.error("Server communication error:", error);
            talk("Sorry, there was an error communicating with the server.");
        }
    }

    function talk(text) {
        console.log("Attempting to speak:", text);
        giriResponseText.textContent = `🎙️ GIRI: ${text}`;
        const utterance = new SpeechSynthesisUtterance(text);
        window.speechSynthesis.speak(utterance);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    // Get the necessary elements from the page
    const startBtn = document.getElementById('start-btn');
    const statusText = document.getElementById('status-text');
    const userCommandText = document.getElementById('user-command');
    const giriResponseText = document.getElementById('giri-response');

    // A variable to keep track of the current state
    let isListening = false;

    // --- Core Functions ---

    /**
     * Starts the listening process
     */
    const startListening = () => {
        // Do nothing if it's already listening
        if (isListening) {
            return;
        }
        
        console.log('Starting assistant...');
        isListening = true;
        startBtn.classList.add('listening'); // Adds the animation class
        statusText.textContent = 'Listening...';
        
        // Clear previous command and response for a new session
        userCommandText.textContent = '';
        giriResponseText.textContent = '';
        
        // TODO: Add your actual speech recognition start logic here
    };

    /**
     * Stops the listening process
     */
    const stopListening = () => {
        // Do nothing if it's already stopped
        if (!isListening) {
            return;
        }

        console.log('Stopping assistant...');
        isListening = false;
        startBtn.classList.remove('listening'); // Removes the animation class
        statusText.textContent = 'Click the button or press Ctrl+S to start';
        
        // TODO: Add your actual speech recognition stop logic here
    };
    
    // --- Event Handlers ---

    // 1. Handle button click (toggle function)
    startBtn.addEventListener('click', () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });

    // 2. Handle keyboard shortcuts
    document.addEventListener('keydown', (event) => {
        // Start listening with Ctrl + S
        if (event.ctrlKey && event.key.toLowerCase() === 's') {
            event.preventDefault(); // Prevents the browser's "Save" dialog
            startListening();
        }

        // Stop listening with Ctrl + E
        if (event.ctrlKey && event.key.toLowerCase() === 'e') {
            event.preventDefault(); // Prevents any default browser action
            stopListening();
        }
    });

    // Set initial status text
    statusText.textContent = 'Click the button or press Ctrl+S to start';
});



// --- Main Button Event Listener ---
    // startBtn.addEventListener('click', () => {
    //     console.log("Button clicked.");
    //     try {
    //         recognition.start();
    //     } catch (error) {
    //         console.error("Error starting recognition:", error);
    //         statusText.textContent = "Error: Could not start listening.";
    //     }
    // });
    
