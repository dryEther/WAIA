const axios = require('axios');
const { loadApiMetadata, getApiConfig, formatMessagesForOllama, buildUrlWithParams, extractJsonFromText } = require('./utils');
const { addMessage, getMessages } = require('./memory');
const configManager = require('./configHandler');
let config = configManager.getSettings();
let promptManagerInstance = null;

// config.on("updated", (newConfig) => {
//     console.log("Settings were updated:", newConfig);
// });
function init(promptManager) {
    promptManagerInstance = promptManager;
}

async function callExternalApi(apiName, params) {
    [source, apiName] = apiName.split('-');
    const apiConfig = getApiConfig(config.apiFolder, apiName, source);
    if (config.debug) { console.log("API Config:", apiConfig); } // Debugging line
    const { url, method, responsefields } = apiConfig;
    const fullUrl = buildUrlWithParams(url, params);
    try {
        if (config.debug) { console.log(`Calling API: ${apiName} with URL: ${fullUrl}`); } // Debugging line

        const response = await axios({
            method: method || 'GET',
            url: fullUrl,
            params: method === 'GET' ? params : undefined,
            data: method === 'POST' ? params : undefined
        });

        if (config.debug) { console.log(response.data); } // Debugging line
        return response.data;

    } catch (error) {
        if (config.debug) { console.log(error.message); } // Debugging line
        return error.message;
    }
}



async function listModels() {
    const res = await axios.get(`${config.ollama.baseUrl}/api/tags`);
    return res.data.models.map(m => m.name);
}

async function callOllama(messages) {
    const res = await axios.post(`${config.ollama.baseUrl}/api/generate`, {
        model: config.selectedModel || 'llama3',
        prompt: formatMessagesForOllama(messages),
        stream: false
    }, {
        headers: { 'Content-Type': 'application/json' }
    });

    return res.data.response?.trim();
}

async function chatWithModel(msobj, prompt, settings) {
    // For Ollama, we need to format the messages differently
    const sender = msobj.pushname;
    const senderId = msobj.key.remoteJid.split('@')[0];
    config = settings;
    const apis = loadApiMetadata(config.apiFolder);
    const enrichedData = {};


    // Step 1: Check if memory is needed
    const conversationHistory = await callOllama([{
        role: 'system',
        content: promptManagerInstance.getPrompt(senderId, 'Memory_Check', { sender: sender })
    },
    { role: 'user', content: prompt }]);

    if (config.debug) { console.log("Conversation History:", conversationHistory); } // Debugging line
    const history = (conversationHistory === 'HISTORY_NEEDED') ? getMessages(sender) : [];
    addMessage(sender, prompt, config.maxTokens); // Save the message to memory
    if (config.debug) { console.log("History:", history); } // Debugging line
    // Step 2: Determine Exernal Data Needs
    const firstMessages = [
        {
            role: 'system',
            content: promptManagerInstance.getPrompt(senderId, 'Tag_Check', { sender: sender })
        },
        //(history) ? { role: 'system', content: `Use the following chat history for context: ${history}` } : {},
        { role: 'user', content: prompt }
    ];
    const infoNeedResponse = await callOllama(firstMessages);
    if (config.debug) { console.log(infoNeedResponse); } // Debugging line
    let needs = [];
    try {
        needs = extractJsonFromText(infoNeedResponse);
        if (config.debug) { console.log("First Response:", needs); } // Debugging line
    } catch (e) {
        if (config.debug) { console.error("Failed to parse info needs:", infoNeedResponse); } // Debugging line
    }
    if (needs.length !== 0) {
        // Step 3: Filter APIs based on needed info
        const relevantApis = apis.filter(api =>
            needs.some(need =>
                api.tags?.some(tag => tag.toLowerCase().includes(need.toLowerCase())) ||
                api.name.toLowerCase().includes(need.toLowerCase())
            )
        );
        if (relevantApis.length !== 0) {

            const relevantApiJson = JSON.stringify(relevantApis, null, 2); // full data
            if (config.debug) { console.log("Relevant APIs:", relevantApiJson); } // Debugging line
            const secondMessages = [
                {
                    role: 'system',
                    content: promptManagerInstance.getPrompt(senderId, 'API_Check', {   chatHistory: history,
                                                                                        externalData: relevantApiJson })
                },
                { role: 'user', content: prompt }
            ];

            const plan = await callOllama(secondMessages);
            let parsedCalls = [];
            try {
                parsedCalls = extractJsonFromText(plan);
                if (config.debug) { console.log("Seccond Response:", parsedCalls); } // Debugging line
            } catch (e) {
                if (config.debug) { console.error("Failed to parse API call plan:", plan); } // Debugging line
            }
            if (parsedCalls) {
                // Step 3: Make API calls

                for (const { name, params } of parsedCalls) {
                    try {
                        if (config.debug) { console.log("API Call:", name, params); } // Debugging line
                        enrichedData[name] = await callExternalApi(name, params);
                    } catch (e) {
                        if (config.debug) { console.error(`API ${name} failed:`, e.message); } // Debugging line
                        if (config.debug) { console.log(params); } // Debugging line
                    }
                }
            }
        }
    }
    // Step 4: Generate final response
    const enrichedPrompt = [
        {
            role: 'system',
            content: promptManagerInstance.getPrompt(senderId, 'Response_Check',
                {
                    chatHistory: Object.keys(history).length > 0
                        ? Object.entries(history).toString()
                        : 'NOT_AVAILABLE',
                    externalData: Object.keys(enrichedData).length > 0
                        ? Object.entries(enrichedData).map(([api, val]) => `- ${api}: ${JSON.stringify(val)}`).join('\n').trim()
                        : 'NOT_AVAILABLE',
                    location: config.location || 'NOT_AVAILABLE',
                    currentDateTime: new Date().toString(),
                    admin: config.recipient
                }),
        },
        {
            role: 'system', content: promptManagerInstance.getPrompt(senderId, 'About_Admin', {
                location: config.location || 'NOT_AVAILABLE',
                currentDateTime: new Date().toString(),
                admin: config.recipient
            })
        },
        {
            role: 'system', content: promptManagerInstance.getPrompt(senderId, 'Add_Info', {
                location: config.location || 'NOT_AVAILABLE',
                currentDateTime: new Date().toString(),
                sender: sender,
                admin: config.recipient
            })
        },
        { role: 'user', content: prompt }
    ];
    if (config.debug) { console.log("Enriched Prompt:", enrichedPrompt); } // Debugging line
    return await callOllama(enrichedPrompt);
    // }
}

module.exports = { init, listModels, chatWithModel };
