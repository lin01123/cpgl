const express = require('express');
const fs = require('fs');
const path = require('path');
const http = require('http');
const https = require('https');

const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'products.json');

app.get('/products', (req, res) => {
  fs.readFile(DATA_FILE, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.json([]);
      }
      return res.status(500).json({ error: 'Failed to read data' });
    }
    try {
      const products = JSON.parse(data || '[]');
      res.json(products);
    } catch (e) {
      res.status(500).json({ error: 'Malformed data' });
    }
  });
});

app.post('/products', (req, res) => {
  fs.writeFile(DATA_FILE, JSON.stringify(req.body, null, 2), err => {
    if (err) {
      return res.status(500).json({ error: 'Failed to save data' });
    }
    res.json({ status: 'ok' });
  });
});

app.get('/proxy', (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing url');
  }
  const client = targetUrl.startsWith('https') ? https : http;
  client.get(targetUrl, resp => {
    let data = '';
    resp.on('data', chunk => { data += chunk; });
    resp.on('end', () => res.send(data));
  }).on('error', err => {
    res.status(500).send('Error fetching url');
  });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
