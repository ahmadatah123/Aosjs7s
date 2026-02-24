const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DB = './database.json';

app.use(express.json());
if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify([]));

// Serve the website
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// Generate Key
app.get('/gen', (req, res) => {
    let keys = JSON.parse(fs.readFileSync(DB));
    const newKey = "MOD-" + Math.random().toString(36).substring(2, 10).toUpperCase();
    keys.push({ key: newKey, hwid: null });
    fs.writeFileSync(DB, JSON.stringify(keys, null, 2));
    res.send(newKey);
});

// List Keys
app.get('/list-keys', (req, res) => res.json(JSON.parse(fs.readFileSync(DB))));

// Reset HWID
app.post('/reset', (req, res) => {
    let keys = JSON.parse(fs.readFileSync(DB));
    let k = keys.find(x => x.key === req.body.key);
    if (k) k.hwid = null;
    fs.writeFileSync(DB, JSON.stringify(keys, null, 2));
    res.sendStatus(200);
});

// App Login
app.post('/login', (req, res) => {
    const { key, hwid } = req.body;
    let keys = JSON.parse(fs.readFileSync(DB));
    let k = keys.find(x => x.key === key);

    if (!k) return res.json({ status: "error", msg: "Invalid Key" });
    if (!k.hwid) {
        k.hwid = hwid;
        fs.writeFileSync(DB, JSON.stringify(keys, null, 2));
        return res.json({ status: "success", msg: "Device Registered!" });
    }
    if (k.hwid === hwid) return res.json({ status: "success", msg: "Welcome Back" });
    res.json({ status: "error", msg: "HWID Mismatch!" });
});

app.listen(PORT, () => console.log(`Server live on port ${PORT}`));

