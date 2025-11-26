// Chat Page JavaScript

function scrollToBottom() {
    const container = document.getElementById('chatContainer');
    if (container) {
        container.scrollTop = container.scrollHeight;
    }
}

// Scroll to bottom on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scrollToBottom);
} else {
    scrollToBottom();
}

// Focus input on page load
const chatInput = document.getElementById('chat-input');
if (chatInput) {
    setTimeout(() => chatInput.focus(), 300);
}

// Append user bubble instantly before request
document.body.addEventListener('htmx:beforeRequest', function (evt) {
    if (evt.target.id !== 'chat-form') return;
    const input = evt.target.querySelector('input[name="message"]') || document.getElementById('chat-input');
    const text = input?.value?.trim();
    if (!text) return;

    const messages = document.getElementById('messages');
    if (!messages) return;

    const userDiv = document.createElement('div');
    userDiv.className = 'flex justify-end';
    userDiv.innerHTML = `
        <div class="message-bubble bg-gradient-to-br from-purple-500 to-pink-600 text-white p-3 rounded-2xl rounded-tr-sm">
            ${text.replace(/</g, "&lt;")}
        </div>
    `;
    messages.appendChild(userDiv);

    // Clear input immediately after capturing the message
    input.value = '';

    // Remove existing typing indicator if any
    const oldTyping = document.getElementById('typing-indicator');
    if (oldTyping) oldTyping.remove();

    // Add typing indicator for AI
    const typingDiv = document.createElement('div');
    typingDiv.className = 'flex justify-start';
    typingDiv.id = 'typing-indicator';
    typingDiv.innerHTML = `
        <div class="glass p-3 rounded-2xl rounded-tl-sm">
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        </div>
    `;
    messages.appendChild(typingDiv);
    scrollToBottom();
});

// Show typing indicator when sending message
document.body.addEventListener('htmx:afterRequest', function (evt) {
    if (evt.target.id !== 'chat-form') return;
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();
    scrollToBottom();

    // Auto-speak the new message if it's from AI
    // We need to find the last message added
    const messages = document.getElementById('messages');
    const lastMessage = messages.lastElementChild;
    if (lastMessage && !lastMessage.classList.contains('justify-end')) {
        // It's an AI message (justify-start)
        const text = lastMessage.innerText;
        speakMessage(text);
    }
});

// TTS Function
window.speakMessage = function (text) {
    if (window.SpeechManager) {
        window.SpeechManager.speak(text);
    }
};
