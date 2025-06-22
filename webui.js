const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const PORT = 3000;
const CONFIG_PATH = path.join(__dirname, 'Data', 'config.json');

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); 

// API: Get config
app.get('/api/config', (req, res) => {
  fs.readFile(CONFIG_PATH, 'utf8', (err, data) => {
    console.log('Reading config.json');
    if (err) return res.status(500).json({ error: 'Failed to read config.json' });
    res.json(JSON.parse(data));
  });
});

// API: Save config (for future use)
app.post('/api/config', (req, res) => {
  fs.writeFile(CONFIG_PATH, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).json({ error: 'Failed to write config.json' });
    res.json({ success: true });
  });
});

const PROMPTS_PATH = path.join(__dirname, 'Data', 'prompts.json');

// API: Get prompts
app.get('/api/prompts', (req, res) => {
  fs.readFile(PROMPTS_PATH, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Failed to read prompts.json' });
    res.json(JSON.parse(data));
  });
});

// API: Save prompts
app.post('/api/prompts', (req, res) => {
  // Validate that default section exists and is not empty
  const body = req.body;
  if (!body.default || Object.keys(body.default).length === 0) {
    return res.status(400).json({ error: 'default section must be present and not empty' });
  }

  fs.writeFile(PROMPTS_PATH, JSON.stringify(body, null, 2), (err) => {
    if (err) return res.status(500).json({ error: 'Failed to write prompts.json' });
    res.json({ success: true });
  });
});


// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
