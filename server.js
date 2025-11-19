
const express = require('express');
const path = require('path');
const submissionsRouter = require('./submissions');
const adminRouter = require('./admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(__dirname));

app.use('/api/submissions', submissionsRouter);
app.use('/api/admin', adminRouter);

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

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
