const messages = {
    error: {
        invalidSelection: "❌ Invalid selection. Please send a number from the list.",
        missingContactName: "❌ Please provide a valid Contact Name.",
        missingContact: "❌ Please provide a valid Contact.",
        generic: "Sorry, something went wrong.",
    },
    success: {
        modelChanged: (model) => `✅ Model changed to: ${model}`,
        adminDelegated: (admin) => `✅ Admin privileges deligated to: ${admin}`,
        contactIgnored: (contact) => `✅ Ignored Contact: ${contact}`,
        contactUnignored: (contact) => `✅ Unignored Contact: ${contact}`,
        webUIEnabled: "✅ Web UI enabled.",
        webUIDisabled: "✅ Web UI disabled."

    },
    info: {
        missedCall: "Sorry, I missed your call. You may chat with my AI assistant",
        deleteAuth: "Session logged out. Delete Auth folder and re-authenticate.",
        reconnect: "Connection closed. Reconnecting:",
        connected: "WhatsApp bot connected!",
        ignoredContacts: "*Ignored Contacts*: \n",
        noIgnoredContacts: "No Ignored Contacts.",
    },
    warning: {
        noModelAvailable: "⚠️ No models available. Check your API key and URL.",
        noModelSelected: "⚠️ No model selected. Use `!model` to choose one.",
    },
    textElements: {
        availableModelsIntro: "📌 Available Models:\n",
        availableModelsOutro: "\n\nReply with a number to select.",
        skippingPushName: (name) => `Skipping PushName : ${name}`,
        skippingSender: (sender) => `Skipping Sender : ${sender}`,
        skippingGroup: (group) => `Skipping Group : ${group}`,
        skippingChatId: (id) => `Skipping ChatId : ${id}`,
        incomingCall: (caller) => `Incoming call from ${caller}`,
        missedCall: (caller) => `Missed call from ${caller}. Sending default message...`,
        incomingMessage: (name, id, text) => `📩 Message from ${name}(${id}): ${text}`,
        replySent: (name, reply) => `📤 Reply sent to ${name}: ${reply}`,
        errorHandling: "❌ Error handling message:",
        adminNumber: (admin) => `✅ Admin Number: ${admin}`,
        selectedModel: (model) => `✅ Selected Model: ${model}`,
        ignoredContacts: (contacts) => `✅ Ignored Contacts: ${contacts}`,
        unignoreLog: (contact) => `Unignore Contact : ${contact}`,
    }
}

module.exports = { messages };