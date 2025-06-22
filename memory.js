// memory.js
const chatStore = new Map(); // jid -> [msg1, msg2, ...]

function addMessage(sender, prompt, MAX_MESSAGES) {
    // optional: filter certain messages

    const msgs = chatStore.get(sender) || [];
    msgs.push(prompt);

    // Keep only the latest N messages
    if (msgs.length > MAX_MESSAGES) {
        msgs.shift(); // remove oldest
    }

    chatStore.set(sender, msgs);
}

function getMessages(sender){
    return chatStore.get(sender) || [];
}

function clearMessages(sender) {
    chatStore.delete(sender);
}

module.exports = {
    addMessage,
    getMessages,
    clearMessages,
};
