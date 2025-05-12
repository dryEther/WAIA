# WAIA - WhatsApp AI Assistant 🤖📱

**WAIA** connects to your WhatsApp account via the **Linked Devices** feature and responds to incoming messages using a selected **Large Language Model (LLM)** via **Ollama**. Designed for lightweight deployment, WAIA enhances the standard chat experience with contextual understanding, configurable responses, and support for real-time external data via APIs.

---

## 🚀 Features

- ✅ Connects via WhatsApp's QR code-based Linked Devices  
- ✅ Responds to messages using LLMs from an Ollama instance  
- ✅ Configurable admin control and prompt management  
- ✅ Lightweight external API integration (e.g., Weather, Time)  
- ✅ Easy-to-customize system prompts for different users or scenarios  
- ✅ Debug mode for advanced logging  
- ✅ Early support for contextual awareness using conversation history and user metadata  

---

## 🛠️ Initialization & Setup

1. Clone the repository and run the program.
2. On the first run, you'll be prompted to scan a QR code using WhatsApp's Linked Devices scanner.
3. Once connected, WAIA reads from a config file located at:
```
/usr/src/app/config.json
```
4. Update this file with your custom values:
- `admin`: Your WhatsApp contact (format: `countrycode+number`)
- `ollamaUrl`: The endpoint for Ollama
- `selectedModel`: Default LLM to use
5. On successful setup, you’ll see:
```
Whatsapp bot connected.
```
WAIA is now ready to listen and respond!

---

## 🔧 Configuration Options

| Key                     | Description                                                                 |
|-------------------------|-----------------------------------------------------------------------------|
| `admin`                 | WhatsApp contact with command access                                        |
| `recipient`             | Name the AI should impersonate                                              |
| `location` / `timeZone` | For contextual awareness                                                    |
| `selectedModel`         | Default LLM model                                                           |
| `debug`                 | Enables verbose logging                                                     |
| `apiFolder`             | Folder path containing API definitions                                      |
| `ollamaUrl`             | Ollama server endpoint                                                      |
| `invertIgnore`          | If `true`, only respond to contacts listed in `ignoreContacts`              |
| `ignoreContacts`        | List of users to ignore                                                     |
| `hCount`                | Number of past messages used for context                                    |
| `promptsFilePath`       | Path to system prompts file                                                 |
| `promptsReloadIntervalMs` | How frequently to reload the prompts file (in milliseconds)              |

---

## 🔐 Admin Commands

WAIA supports admin-only commands (prefixed with `!`) for live configuration changes:

### 📌 LLM Control
- `!model`: View and select available LLMs from Ollama

### 👤 Admin Management
- `!admin <username>`: Delegate admin rights

### 🚫 Contact Management
- `!ignore <contact>`: Ignore a user or group  
- `!ignorelist`: View ignored contacts  
- `!unignore <contact>`: Remove a user from the ignore list  

### 🧩 Prompt Customization
- `!prompt Add <contact> <prompt_Type> <prompt>`: Add prompt for a contact or `default`  
- `!prompt list <contact>`: View prompt sets  
- `!prompt remove <contact> <prompt_Type> <prompt_number>`: Remove a prompt  

---

## 🧠 Prompt Types

WAIA uses structured system prompts to enhance interaction quality. Prompts can be defined globally (`default`) or per-contact:

- **Memory Check** – Determines need for chat history  
- **Tag Check** – Identifies if API data is needed  
- **API Check** – Prepares payloads for APIs  
- **Response Check** – Final LLM query for generating responses  
- **About_Admin** – PII info used when necessary  
- **Add_Info** – Any extra context for better responses  

---

## 🌐 API Integration

WAIA integrates with external APIs to provide real-time, enriched responses.

- Define APIs as `.json` files inside the configured `apiFolder`
- Each API contains tags that WAIA uses to match with LLM query context
- Examples included: **Time API**, **Weather API**

This acts as a lightweight data augmentation mechanism — without relying on LLM-native tool calling or heavy RAG implementations.

---

## ⚠️ Notes

- This is a **vibe-coded**, very early **beta release**
- The goal is to enable local, private, intelligent WhatsApp automation with minimal overhead
- Contributions, feedback, and bug reports are **highly appreciated** 🙏

---

## 📢 Contribute

Have ideas to improve WAIA? Pull requests, prompt examples, or API suggestions are welcome!

---

## 🧑‍💻 Author's Note

> "After years of self-hosting and using community-built apps, this project is my way of giving back. It’s experimental, it’s rough around the edges — but it’s open and evolving."

---

## 📜 License

**GNU General Public License v3.0** – See the [`LICENSE`](./LICENSE) file for details.
