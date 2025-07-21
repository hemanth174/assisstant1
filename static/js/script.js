document.addEventListener('DOMContentLoaded', () => {
    // --- Get Elements ---
    const startBtn = document.getElementById('start-btn');
    const statusText = document.getElementById('status-text');
    const userCommandText = document.getElementById('user-command');
    const giriResponseText = document.getElementById('giri-response');
    const openSidebarBtn = document.getElementById('openSidebarBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');
    const sidebar = document.getElementById('sidebar');

    console.log("Script loaded.");

    // --- Browser Feature Checks ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const synth = window.speechSynthesis;

    if (!SpeechRecognition) {
        statusText.textContent = "Error: Speech Recognition is not supported by this browser.";
        startBtn.disabled = true;
        return;
    }
    if (!synth) {
        statusText.textContent = "Error: Speech Synthesis is not supported by this browser.";
        startBtn.disabled = true;
        return;
    }

    // --- State and Instances ---
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN'; // English (India)
    recognition.interimResults = false;
    let isListening = false;

    // --- Core Functions ---
    const startListening = () => {
        if (isListening) return;
        try {
            isListening = true;
            userCommandText.textContent = '';
            giriResponseText.textContent = '';
            recognition.start();
        } catch (error) {
            console.error("Error starting recognition:", error);
            statusText.textContent = "Error: Could not start listening.";
            isListening = false;
        }
    };

    const stopListening = () => {
        if (!isListening) return;
        try {
            recognition.stop();
            // onend will handle state changes
        } catch (error) {
            console.error("Error stopping recognition:", error);
            statusText.textContent = "Error: Could not stop listening.";
            isListening = false;
        }
    };

    const speak = (text) => {
        giriResponseText.textContent = `🗣️ GIRI: ${text}`;
        const utterance = new SpeechSynthesisUtterance(text);
        
        utterance.onstart = () => {
            console.log("Speech started.");
            startBtn.classList.remove('processing');
            startBtn.classList.add('speaking'); // Add speaking state
        };
        utterance.onend = () => {
            console.log("Speech ended.");
            startBtn.classList.remove('speaking'); // Remove speaking state
            // You could re-enable listening here if desired
        };

        synth.speak(utterance);
    };

    const sendCommandToServer = async (command) => {
        console.log("Sending command to server:", command);
        statusText.textContent = "Processing...";
        startBtn.classList.remove('listening');
        startBtn.classList.add('processing'); // Add processing state

        try {
            const response = await fetch('/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: command }),
            });
            const data = await response.json();
            console.log("Received response from server:", data);
            
            speak(data.text);

            if (data.action_url) {
                console.log("Opening URL in new tab:", data.action_url);
                window.open(data.action_url, '_blank');
            }
        } catch (error) {
            console.error("Server communication error:", error);
            speak("Sorry, there was an error communicating with the server.");
        }
    };

    // --- Speech Recognition Events ---
    recognition.onstart = () => {
        console.log("Recognition started.");
        statusText.textContent = "Listening...";
        startBtn.classList.add('listening');
    };

    recognition.onend = () => {
        console.log("Recognition ended.");
        statusText.textContent = "Click the button or press Ctrl+S to start";
        startBtn.classList.remove('listening', 'processing', 'speaking');
        isListening = false;
    };

    recognition.onresult = (event) => {
        const command = event.results[0][0].transcript;
        console.log("Command recognized:", command);
        userCommandText.textContent = `💬 You said: ${command}`;
        sendCommandToServer(command);
    };

    recognition.onerror = (event) => {
        console.error("Recognition error:", event.error);
        let friendlyError = "Sorry, something went wrong. Please try again.";
        if (event.error === 'no-speech') {
            friendlyError = "I didn't hear anything. Could you speak up?";
        } else if (event.error === 'not-allowed') {
            friendlyError = "Access to the microphone was denied. Please enable it in your browser settings.";
        }
        giriResponseText.textContent = `⚠️ Error: ${friendlyError}`;
    };

    // --- Event Listeners ---
    // Toggle listening with the main button
    startBtn.addEventListener('click', () => {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    });

    // Keyboard shortcuts
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

    // Sidebar controls
    openSidebarBtn.addEventListener('click', () => {
        sidebar.style.width =    '250px';
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.style.width = '0';
    });
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
    