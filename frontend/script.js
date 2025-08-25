
// Global state
let currentUser = null;
let isListening = false;
let recognition = null;
let chatHistory = [];

// Authentication functions
function showLogin() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[0].classList.add('active');
}

function showRegister() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.querySelectorAll('.auth-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.auth-tab')[1].classList.add('active');
}

function login() {
    const email = document.querySelector('#login-form input[type="email"]').value;
    const password = document.querySelector('#login-form input[type="password"]').value;

    fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
    })
    .then(res => {
        if (!res.ok) throw new Error("Login failed");
        return res.json();
    })
    .then(data => {
        currentUser = data.user;
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('chat-interface').classList.remove('hidden');
        document.querySelector('.username').textContent = currentUser.full_name;
    })
    .catch(err => alert(err.message));
}


function register() {
    // Simulate registration process
    const name = document.querySelector('#register-form input[placeholder="Full Name"]').value;
    const email = document.querySelector('#register-form input[type="email"]').value;
    const studentId = document.querySelector('#register-form input[placeholder="Student/Staff ID"]').value;
    const password = document.querySelector('#register-form input[type="password"]').value;
    const confirmPassword = document.querySelector('#register-form input[placeholder="Confirm Password"]').value;
    
    if (name && email && password && confirmPassword) {
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        currentUser = {
            name: name,
            email: email,
            id: studentId || "MU2024001"
        };
        
        document.getElementById('auth-screen').classList.add('hidden');
        document.getElementById('chat-interface').classList.remove('hidden');
        
        // Update username in sidebar
        document.querySelector('.username').textContent = currentUser.name;
        
        // Load chat history
        loadChatHistory();
    } else {
        alert('Please fill in all required fields');
    }
}

function logout() {
    currentUser = null;
    document.getElementById('chat-interface').classList.add('hidden');
    document.getElementById('auth-screen').classList.remove('hidden');
    
    // Clear forms
    document.querySelectorAll('input').forEach(input => input.value = '');
    
    // Reset chat
    document.getElementById('chat-messages').innerHTML = getWelcomeMessage();
}

// User menu functions
function toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('hidden');
}

function showProfile() {
    alert('Profile functionality would be implemented here');
    document.getElementById('user-dropdown').classList.add('hidden');
}

function showNotifications() {
    alert('Notifications: \n• New scholarship announcements\n• Exam schedule updated\n• Library hours changed');
    document.getElementById('user-dropdown').classList.add('hidden');
}

// Chat functions
function loadChatHistory() {
    // Simulate loading chat history
    chatHistory = [
        { id: 1, title: "Admission Requirements", preview: "What are the admission requirements for..." },
        { id: 2, title: "Engineering Courses", preview: "Tell me about the engineering programs..." },
        { id: 3, title: "Campus Facilities", preview: "What facilities are available on campus..." }
    ];
    
    updateChatHistoryDisplay();
}

function updateChatHistoryDisplay() {
    const historyContainer = document.getElementById('chat-history');
    historyContainer.innerHTML = '';
    
    chatHistory.forEach(chat => {
        const chatItem = document.createElement('div');
        chatItem.className = 'chat-item';
        chatItem.innerHTML = `
            <i class="fas fa-comment"></i>
            <span>${chat.title}</span>
        `;
        chatItem.onclick = () => loadChat(chat.id);
        historyContainer.appendChild(chatItem);
    });
}

function startNewChat() {
    document.getElementById('chat-messages').innerHTML = getWelcomeMessage();
    document.getElementById('chat-input').value = '';
}

function loadChat(chatId) {
    // Simulate loading a specific chat
    const chat = chatHistory.find(c => c.id === chatId);
    if (chat) {
        document.getElementById('chat-messages').innerHTML = `
            <div class="message assistant">
                <div class="message-avatar">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="message-content">
                    Previous conversation about "${chat.title}" would be loaded here.
                </div>
            </div>
        `;
    }
}

function getWelcomeMessage() {
    return `
        <div class="welcome-message">
            <div class="assistant-avatar">
                <i class="fas fa-graduation-cap"></i>
            </div>
            <h3>What can I help with?</h3>
            <p>Ask me anything about Mehran University - admissions, courses, facilities, events, and more!</p>
            
            <div class="suggestion-chips">
                <button class="suggestion-chip" onclick="sendSuggestion('Tell me about engineering programs')">
                    Engineering Programs
                </button>
                <button class="suggestion-chip" onclick="sendSuggestion('What are the admission requirements?')">
                    Admission Requirements
                </button>
                <button class="suggestion-chip" onclick="sendSuggestion('Show campus facilities')">
                    Campus Facilities
                </button>
                <button class="suggestion-chip" onclick="sendSuggestion('Upcoming events and announcements')">
                    Events & News
                </button>
            </div>
        </div>
    `;
}

function sendSuggestion(text) {
    document.getElementById('chat-input').value = text;
    sendMessage();
}

// Function to send message to the backend and get a response
function sendMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (!message) return;

    // Show user message
    addMessage(message, 'user');
    input.value = '';

    // Send message to the backend (FastAPI)
    fetch("http://localhost:8000/chat", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: message })
    })
    .then(res => res.json())
    .then(data => {
        // Show assistant response
        addMessage(data.answer, 'assistant');
    })
    .catch(err => {
        console.error("API error:", err);
        addMessage("Sorry, there was a problem connecting to the server.", 'assistant');
    });
}



// Function to display messages in the chat interface
function addMessage(content, sender) {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    
    const avatar = sender === 'user' 
        ? '<i class="fas fa-user"></i>'
        : '<i class="fas fa-graduation-cap"></i>';
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            ${avatar}
        </div>
        <div class="message-content">
            ${content}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);

    // Wait for DOM to render before scrolling
    setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 0);
}


function generateResponse(message) {
    const responses = {
        'engineering programs': 'Mehran University offers various engineering programs including Civil, Mechanical, Electrical, Computer Systems, and Chemical Engineering. Each program is designed with modern curriculum and state-of-the-art facilities.',
        'admission requirements': 'For undergraduate programs, you need to have completed FSc/A-Level with minimum 60% marks. You must also pass the university entrance test (MUET) and meet specific criteria for your chosen program.',
        'campus facilities': 'Our campus features modern laboratories, a central library with digital resources, sports facilities, hostels, cafeteria, medical center, and Wi-Fi connectivity throughout the campus.',
        'events': 'Upcoming events include the Annual Tech Fair (March 15-17), Career Counseling Week (March 20-24), and Sports Gala (April 1-5). Check the notice board for more details.',
        'default': 'Thank you for your question about Mehran University. I\'d be happy to help you with information about our programs, admissions, facilities, or any other university-related queries. Could you please be more specific about what you\'d like to know?'
    };
    
    const lowerMessage = message.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
        if (lowerMessage.includes(key)) {
            return response;
        }
    }
    
    return responses.default;
}

// Voice input functions
function toggleVoiceInput() {
    if (isListening) {
        stopVoiceInput();
    } else {
        startVoiceInput();
    }
}



function startVoiceInput() {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('Speech recognition is not supported in your browser');
        return;
    }

    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    let silenceTimeout;
    let finalTranscript = '';

   
    recognition.onstart = () => {
    isListening = true;
    const voiceBtn = document.querySelector('.voice-btn');
    voiceBtn.classList.add('active');
    voiceBtn.innerHTML = '<i class="fas fa-stop"></i>'; // Change to stop icon
    document.getElementById('voice-indicator').classList.remove('hidden');
};


    recognition.onresult = (event) => {
        clearTimeout(silenceTimeout);
        const results = event.results;
        let interimTranscript = '';

        for (let i = event.resultIndex; i < results.length; ++i) {
            const transcript = results[i][0].transcript;
            if (results[i].isFinal) {
                finalTranscript += transcript + ' ';
            } else {
                interimTranscript += transcript;
            }
        }

        document.getElementById('chat-input').value = finalTranscript + interimTranscript;

        // Restart silence timeout
        silenceTimeout = setTimeout(() => {
            stopVoiceInput();
            if (finalTranscript.trim()) {
                sendMessage(); // Automatically send
            }
        }, 2000); // 2 seconds of silence
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        stopVoiceInput();
    };

    recognition.onend = () => {
        stopVoiceInput();
        if (finalTranscript.trim()) {
            sendMessage(); // Auto-send when recognition ends
        }
    };

    recognition.start();
}

function stopVoiceInput() {
    if (recognition) {
        recognition.stop();
    }

    isListening = false;
    const voiceBtn = document.querySelector('.voice-btn');
    voiceBtn.classList.remove('active');
    voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>'; // Revert to mic icon
    document.getElementById('voice-indicator').classList.add('hidden');
}


// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Auto-resize textarea
    const chatInput = document.getElementById('chat-input');
    chatInput.addEventListener('input', () => {
        chatInput.style.height = 'auto';
        chatInput.style.height = Math.min(chatInput.scrollHeight, 120) + 'px';
    });
    
    // Enter to send message
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.user-menu')) {
            document.getElementById('user-dropdown').classList.add('hidden');
        }
    });
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    // Show login screen by default
    showLogin();
});
