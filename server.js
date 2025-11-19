
const express = require('express');
const path = require('path');
const fs = require('fs');
const submissionsRouter = require('./submissions');
const { router: adminRouter } = require('./admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(__dirname));

// Serve static files from generated_news directory
app.use('/news', express.static(path.join(__dirname, 'generated_news')));

// Handle article pages without .html extension
app.get('/news/:slug', (req, res) => {
    const slug = req.params.slug;
    const filePath = path.join(__dirname, 'generated_news', `${slug}.html`);
    
    // Check if the file exists
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            // File doesn't exist, return 404
            res.status(404).send('Article not found');
        } else {
            // File exists, serve it
            res.sendFile(filePath);
        }
    });
});

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
