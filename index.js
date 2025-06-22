global.crypto = require('crypto');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('baileys');
const { init, listModels, chatWithModel } = require('./aiClient');
const configManager = require("./configHandler");
const { messages: msg } = require('./messages');
const PromptManager = require('./promptManager');
const { toggleWebUI } = require('./child');
const QRCode = require('qrcode-terminal');
let settings;
let promptManager = null;

async function initializeSettings(sock) {
    settings = configManager.getSettings();

    console.log(`✅ Admin Number: ${settings.admin}`);
    console.log(`✅ Selected Model: ${settings.selectedModel}`);
    if (!settings.invertIgnore) {
        console.log(`✅ Ignored Contacts: \n--${settings.ignoredContacts.join(",\n--")}`);
    } else {
        console.log(`✅ Allowed Contacts: \n--${settings.ignoredContacts.join(",\n--")}`);
    }
    toggleWebUI(true);  // Enable WebUI by default
    console.log(`✅ WebUI: Enabled on port 3000`);

    promptManager = new PromptManager({
        promptsFilePath: settings.promptsFilePath,
        reloadIntervalMs: settings.promptsReloadIntervalMs
    });
    init(promptManager);
}

async function connectWhatsApp() {

    let waitingForModelSelection = {};
    let activeCalls = new Map(); // Track active calls
    let groups = [];

    const { state, saveCreds } = await useMultiFileAuthState('Auth');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    sock.ev.on("creds.update", saveCreds);
    sock.ev.on("connection.update", async (update) => {
        const { connection, lastDisconnect, qr } = update;

        // 📌 If QR is available, display it using clean terminal rendering
        if (qr) {
            console.clear();
            console.log("Scan this QR code with WhatsApp:");
            QRCode.generate(qr, { small: true }, (qrcode) => {
                console.log(qrcode.toString());
            });
        }


        if (connection === 'close') {
            const shouldReconnect = (lastDisconnect?.error)?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log(msg.info.reconnect, shouldReconnect);
            if (shouldReconnect) {
                connectWhatsApp(); // recursively reconnect
            } else {
                console.log(msg.info.deleteAuth);
            }
        } else if (connection === 'open') {
            await initializeSettings(sock);
            groups = await sock.groupFetchAllParticipating();
            console.log(msg.info.connected);
        }
    });

    // Handle Missed Calls
    sock.ev.on("call", async (calls) => {
        if (calls) {
            for (const call of calls) {

                const caller = call.from;

                if (call.status === "offer") {
                    activeCalls.set(caller, true);
                    console.log(`Incoming call from ${caller}`);
                }

                if (call.status === "terminate") {
                    activeCalls.delete(caller);
                    console.log(`Missed call from ${caller}. Sending default message...`);
                    await sock.sendMessage(caller, { text: msg.info.missedCall });
                }
            }
        }

    });

    sock.ev.on("messages.upsert", async (request, type) => {
        settings = configManager.getSettings();
        const message = request.messages[0];
        if (settings.debug) { console.log("Message Received :", message); } //Debugging

        if (!message || (message.key.fromMe && (settings.admin !== message.key.remoteJid.split("@")[0]))
                        || message.status === 1 ) return;
        const chatId = message.key.remoteJid;
        const sender = message.key.participant || chatId;
        const group = groups[chatId]?.subject || null;

        if (!settings.invertIgnore) {
            if (settings.ignoredContacts.includes(message.pushName)) {
                console.log("Skipping PushName :", message.pushName); return;
            }
            if (settings.ignoredContacts.includes(sender.split("@")[0])) {
                console.log("Skipping Sender :", sender.split("@")[0]); return;
            }
            if (group && settings.ignoredContacts.includes(groups[chatId].subject)) {
                console.log("Skipping Group :", groups[chatId].subject); return;
            }
            if (settings.ignoredContacts.includes(chatId.split("@")[0])) {
                console.log("Skipping ChatId :", chatId.split("@")[0]); return;
            }
        } else {

            if (!settings.ignoredContacts.includes(message.pushName) &&
                !settings.ignoredContacts.includes(sender.split("@")[0]) &&
                (!group || !settings.ignoredContacts.includes(groups[chatId].subject)) &&
                !settings.ignoredContacts.includes(chatId.split("@")[0])) {
                console.log("Skipping ChatId :", chatId.split("@")[0]); return;
            }

        }

        let text = message.message?.conversation || message.message?.extendedTextMessage?.text;
        if (settings.debug) { console.log("PushName :", message.pushName); } //Debugging


        if (!text) return;

        if (message.pushName === settings.admin || sender.split("@")[0] === settings.admin) {

            // Handle model selection response
            if (waitingForModelSelection[sender]) {

                let selectedIndex = parseInt(text);
                if (!isNaN(selectedIndex) && selectedIndex > 0 && selectedIndex <= waitingForModelSelection[sender].length) {
                    settings.selectedModel = waitingForModelSelection[sender][selectedIndex - 1];

                    // Save the selected model to settings.json
                    (async () => { await configManager.saveSettings(settings); })();

                    delete waitingForModelSelection[sender];
                    await sock.sendMessage(chatId, { text: msg.success.modelChanged(settings.selectedModel) }); //`✅ Model changed to: ${settings.selectedModel}`
                    if (settings.debug) { console.log(`Model changed to: ${settings.selectedModel}`); } //Debugging
                } else {
                    await sock.sendMessage(chatId, { text: msg.error.invalidSelection }); //`❌ Invalid selection. Please send a number from the list.`
                }
                return;
            }

            if (text[0] === "!") {

                // Handle Commands//
                //=========================================================================================================================
                // Trigger MODEL selection
                if (text.trim().toLowerCase() === "!model") {
                    let models = await listModels();
                    if (models.length === 0) {
                        await sock.sendMessage(chatId, { text: msg.messages.warning.noModelAvailable });
                        return;
                    }

                    waitingForModelSelection[sender] = models;
                    let modelList = models.map((m, i) => `${i + 1}. ${m}`).join("\n");
                    await sock.sendMessage(chatId, {
                        text: msg.textElements.availableModelsIntro
                            + modelList +
                            msg.textElements.availableModelsOutro
                    });
                    return;
                }

                // Trigger Admin Deligation
                if (text.trim().startsWith("!admin")) {
                    const newAdmin = text.split(" ")[1];
                    if (newAdmin) {
                        settings.admin = newAdmin;
                        (async () => { await configManager.saveSettings(settings); })(); // Save the new admin to settings.json
                        await sock.sendMessage(chatId, { text: msg.success.adminDelegated(newAdmin) }); //`✅ Admin privileges deligated to: ${newAdmin}`
                    } else {
                        await sock.sendMessage(chatId, { text: msg.error.missingContactName }); //`❌ Please provide a valid Contact Name.``
                    }
                    return;
                }

                // Trigger Ignored Contacts
                if (text.trim().startsWith("!ignore ")) {
                    const contactToIgnore = text.trim().substring(7).trim();
                    if (contactToIgnore && !settings.ignoredContacts.includes(contactToIgnore)) {
                        (async () => { await configManager.addIgnoredContact(contactToIgnore); })();
                        await sock.sendMessage(chatId, { text: msg.success.contactIgnored(contactToIgnore) }); //`✅ Ignored Contact: ${contactToIgnore}`
                    } else {
                        await sock.sendMessage(chatId, { text: msg.error.missingContact }); //`❌ Please provide a valid Contact.`
                    }
                    return;
                }

                // Trigger Unignore Contacts
                if (text.trim().startsWith("!unignore ")) {
                    const contactToUnignore = text.trim().substring(10).trim();
                    if (settings.debug) { console.log("Unignore Contact :", contactToUnignore); } //Debugging
                    if (contactToUnignore) {
                        (async () => { await configManager.removeIgnoredContact(contactToUnignore); })();
                        await sock.sendMessage(chatId, { text: msg.success.contactUnignored(contactToUnignore) }); //`✅ Unignored Contact: ${contactToUnignore}`
                    } else {
                        await sock.sendMessage(chatId, { text: msg.error.missingContact }); //`❌ Please provide a valid Contact.`
                    }
                    return;
                }

                //Trigger Ignore List
                if (text.trim().toLowerCase() === "!ignorelist") {
                    if (settings.ignoredContacts.length > 0) {
                        await sock.sendMessage(chatId, { text: msg.info.ignoredContacts + settings.ignoredContacts.join(",\n") }); //`*Ignored Contacts*: \n${settings.ignoredContacts.join(", ")}`
                    } else {
                        await sock.sendMessage(chatId, { text: msg.info.noIgnoredContacts }); //`No Ignored Contacts.`
                    }
                    return;
                }

                // Trigger !prompt
                if (text.trim().startsWith("!prompt ")) {
                    await sock.sendMessage(chatId, { text: promptManager.handlePrompt(text) });
                    return;
                }

                // Trigger !webUI
                if (text.trim().startsWith("!webui")) {
                    const webui = text.split(" ")[1];
                    if (webui && webui.trim() !== "") {
                        if (webui.trim().toLowerCase() === "on" || webui.trim().toLowerCase() === "true") {
                            toggleWebUI(true);
                            await sock.sendMessage(chatId, { text: msg.success.webUIEnabled });
                        }
                        else if (webui.trim().toLowerCase() === "off" || webui.trim().toLowerCase() === "false") {
                            toggleWebUI(false);
                            await sock.sendMessage(chatId, { text: msg.success.webUIDisabled });
                        } else {
                            await sock.sendMessage(chatId, { text: msg.error.invalidWebUICommand });
                        }
                    }
                    else {
                        await sock.sendMessage(chatId, { text: msg.error.missingWebUICommand });
                    }
                    return;
                }

                //==========================================================================================================================
            }
        }

        // Ensure a model is selected before sending queries
        if (!settings.selectedModel) {
            await sock.sendMessage(chatId, { text: msg.warning.noModelSelected });
            return;
        } else {

            if (settings.debug) { console.log(`📩 Message from ${message.pushName}(${chatId.split('@')[0]}): ${text}`); } //Debugging
            await sock.readMessages([message.key]);
            try {
                const reply = await chatWithModel(message, text, settings);
                await sock.sendPresenceUpdate('composing', chatId);
                await sock.sendMessage(chatId, { text: reply });
                if (settings.debug) { console.log(`📤 Reply sent to ${message.pushName}: ${reply}`); } //Debugging
            } catch (err) {
                if (settings.debug) { console.error("Error handling message:", err); } //Debugging
                await sock.sendMessage(chatId, { text: msg.error.generic }); //"Sorry, something went wrong."
            }
            return;
        }
    });
}

connectWhatsApp();