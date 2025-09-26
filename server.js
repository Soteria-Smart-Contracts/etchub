
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/news', (req, res) =>
    res.sendFile(path.join(__dirname, 'news.html'))
        );

app.get('/templatestory', (req, res) =>
    res.sendFile(path.join(__dirname, 'templatestory.html'))
        );

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
