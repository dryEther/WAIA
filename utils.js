const fs = require('fs');
const { url } = require('inspector');
const path = require('path');

// function loadConfig() {
//   return JSON.parse(fs.readFileSync('./Data/config.json', 'utf-8'));
// }

// Read all API metadata from folder
function loadApiMetadata(apiFolderPath) {
  const files = fs.readdirSync(apiFolderPath).filter(f => f.endsWith('.json'));

  let allEndpoints = [];

  files.forEach(file => {
    const fullPath = path.join(apiFolderPath, file);
    let json;
    try {
      json = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    } catch (err) {
      console.error(`Error parsing JSON in file ${file}:`, err.message);
      return;
    }

    if (!Array.isArray(json)) {
      console.warn(`Skipping file ${file} because it does not contain an array of endpoints.`);
      return;
    }

    const endpoints = json.map(endpoint => ({

      name: file.split('.')[0] + '-' + endpoint.name,
      description: endpoint.description || '',
      url: endpoint.url,
      method: endpoint.method || 'GET',
      tags: endpoint.tags || [],
      params: endpoint.params || {},
      responseFields: endpoint.responseFields || {}
    }));

    allEndpoints.push(...endpoints);
  });

  return allEndpoints;
}

// Load full config for an API by name
function getApiConfig(apiFolderPath, apiName, source) {
  const filePath = path.join(apiFolderPath, `${source}.json`);
  console.log(filePath);
  const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  // Find the entry where name matches apiName
  const apiConfig = jsonData.find(api => api.name === apiName);
  return apiConfig || null; // Return null if not found
}

function formatMessagesForOllama(messages) {
  return messages.map(m => `${m.role}: ${m.content}`).join('\n') + '\nassistant:';
}

function buildUrlWithParams(url, params) {
  console.log("URL:", url);
  console.log("Params:", params);
  return url.replace(/\{(.*?)\}/g, (_, key) => params[key] || '');
}

function extractJsonFromText(text) {
  const jsonMatch = text.match(/\{[\s\S]*?\}|\[[\s\S]*?\]/g); // match all JSON-looking parts
  if (!jsonMatch) return null;

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("JSON parse failed:", e.message);
    return null;
  }
}


module.exports = { loadApiMetadata, getApiConfig, formatMessagesForOllama, buildUrlWithParams, extractJsonFromText };
