const fs = require('fs');
const path = require('path');
const mustache = require('mustache');

class PromptManager {
  constructor({ promptsFilePath, reloadIntervalMs = 1000 }) {
    this.promptsFilePath = path.resolve(promptsFilePath);
    this.reloadIntervalMs = reloadIntervalMs;
    this.prompts = {};
    this.loadPrompts();
    this.watchPromptsFile();
  }

  loadPrompts() {
    try {
      const fileContent = fs.readFileSync(this.promptsFilePath, 'utf-8');
      this.prompts = JSON.parse(fileContent);
      console.log('[PromptManager] Prompts loaded/reloaded.');
    } catch (error) {
      console.error('[PromptManager] Failed to load prompts:', error);
    }
  }

  watchPromptsFile() {
    fs.watchFile(this.promptsFilePath, { interval: this.reloadIntervalMs }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        console.log('[PromptManager] Detected change in prompts.json, reloading...');
        this.loadPrompts();
      }
    });
  }

  getPrompt(contactId, promptName, placeholders = {}) {
    const contactPrompts = this.prompts[contactId] || {};
    const defaultPrompts = this.prompts['default'] || {};

    const rawPrompt = contactPrompts[promptName] || defaultPrompts[promptName];

    if (!rawPrompt) {
      console.warn(`[PromptManager] Prompt "${promptName}" not found.`);
      return '';
    }

    const promptText = Array.isArray(rawPrompt) ? rawPrompt.join('\n') : rawPrompt;

    return mustache.render(promptText, placeholders);
  }

  savePrompts() {
    try {
      fs.writeFileSync(this.promptsFilePath, JSON.stringify(this.prompts, null, 4));
      console.log('[PromptManager] Prompts saved.');
    } catch (error) {
      console.error('[PromptManager] Failed to save prompts:', error);
    }
  }

  listPrompts(user, type = '*') {
    if (!this.prompts[user]) return `ℹ️ No prompts found for user *${user}*.`;

    const types = type === '*' ? Object.keys(this.prompts[user]) : [type];
    let output = `📚 Prompts for *${user}*:\n`;

    for (const t of types) {
      const list = this.prompts[user][t];
      if (!list || list.length === 0) {
        output += `\n🔹 *${t}*: _No entries_`;
        continue;
      }
      output += `\n🔹 *${t}*:\n`;
      list.forEach((entry, i) => {
        output += `   ${i}. ${entry}\n`;
      });
    }

    return output.trim();
  }

  removePrompt(user, type, index) {
    if (!this.prompts[user] || !this.prompts[user][type])
      return `❌ No such prompt type found for *${user}*.`;

    if (index < 0 || index >= this.prompts[user][type].length)
      return `❌ Invalid index.`;

    const removed = this.prompts[user][type].splice(index, 1);
    this.savePrompts();
    return `🗑️ Removed from *${user}* → *${type}*: "${removed[0]}"`;
  }

  addPrompt(user, type, promptText) {
    if (!this.prompts[user]) this.prompts[user] = {};
    if (!this.prompts[user][type]) this.prompts[user][type] = [];
    this.prompts[user][type].push(promptText);
    this.savePrompts();
    return `✅ Added prompt to *${user}* under *${type}*.`;
  }

  handlePrompt(commandText) {
    const [prefix, actionRaw, ...rest] = commandText.trim().split(' ');
    const action = actionRaw?.toLowerCase();
    console.log('Command:', commandText, 'Action:', action, 'Rest:', rest); // Debugging
    if (prefix !== '!prompt') return null;

    if (action === 'add') {
      const [user, promptType, ...textParts] = rest;
      if (!user || !promptType || textParts.length === 0) {
        return '❌ Usage: !prompt add <User> <Prompt_Type> <Prompt_Text>';
      }

      const promptText = textParts.join(' ').trim().replace(/^"|"$/g, '');
      return this.addPrompt(user, promptType, promptText);
    }

    if (action === 'remove') {
      const [user, promptType, indexStr] = rest;
      const index = parseInt(indexStr);
      if (!user || !promptType || isNaN(index)) {
        return '❌ Usage: !prompt remove <User> <Prompt_Type> <Prompt_Index>';
      }
      return this.removePrompt(user, promptType, index);
    }

    if (action === 'list') {
      const [user, promptType = '*'] = rest;
      if (!user) {
        return '❌ Usage: !prompt list <User> [Prompt_Type]';
      }
      return this.listPrompts(user, promptType);
    }

    return '❌ Unknown action. Use: `add`, `remove`, or `list`.';
  }

}

module.exports = PromptManager;
