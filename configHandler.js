const { watch, readFileSync } = require("fs");
const { writeFile } = require("fs/promises");
const EventEmitter = require("events");

class ConfigHandler extends EventEmitter { 
    constructor(settingsFile = "./Data/config.json") {
        super();
        this.settingsFile = settingsFile;
        this.config = {};
        this.watchInitialized = false;
        this.loadFromFile();
        this.watchSettingsFile();
    }

    loadFromFile() {
        try {
            const raw = readFileSync(this.settingsFile, "utf-8").trimEnd();
            this.config = JSON.parse(raw);
            this.emit("updated", this.config);
        } catch (error) {
            if (error.code === "ENOENT") {
                this.config = {};
            } else {
                console.error("Error loading settings:", error);
            }
        }
    }

    getSettings() {
        return this.config;
    }

    async saveSettings(newSettings) {
        try {
            await writeFile(this.settingsFile, JSON.stringify(newSettings, null, 4));
            this.config = newSettings;
            this.emit("updated", this.config);
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    }

    watchSettingsFile() {
        if (this.watchInitialized) return;
        this.watchInitialized = true;

        watch(this.settingsFile, { persistent: true }, (eventType) => {
            if (eventType === "change") {
                console.log("Settings file changed, reloading...");
                this.loadFromFile();
            }
        });
    }

    async addIgnoredContact(contact) {
        const settings = this.config;
        if (!settings.ignoredContacts) settings.ignoredContacts = [];

        if (!settings.ignoredContacts.includes(contact)) {
            settings.ignoredContacts.push(contact);
            await this.saveSettings(settings);
            return true;
        }
        return false;
    }

    async removeIgnoredContact(contact) {
        const settings = this.config;
        if (!settings.ignoredContacts) return false;

        const index = settings.ignoredContacts.indexOf(contact);
        if (index !== -1) {
            settings.ignoredContacts.splice(index, 1);
            await this.saveSettings(settings);
            return true;
        }
        return false;
    }

    async addIgnoredGroup(groupId) {
        const settings = this.config;
        if (!settings.ignoredGroups) settings.ignoredGroups = [];

        if (!settings.ignoredGroups.includes(groupId)) {
            settings.ignoredGroups.push(groupId);
            await this.saveSettings(settings);
            return true;
        }
        return false;
    }

    async removeIgnoredGroup(groupId) {
        const settings = this.config;
        if (!settings.ignoredGroups) return false;

        const index = settings.ignoredGroups.indexOf(groupId);
        if (index !== -1) {
            settings.ignoredGroups.splice(index, 1);
            await this.saveSettings(settings);
            return true;
        }
        return false;
    }
}

// 👇 Export a SINGLE shared instance
const configInstance = new ConfigHandler();
module.exports = configInstance;
