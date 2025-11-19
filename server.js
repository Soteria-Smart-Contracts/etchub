
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

app.get('/submit', (req, res) =>
    res.sendFile(path.join(__dirname, 'submit.html'))
        );

app.get('/templatestory', (req, res) =>
    res.sendFile(path.join(__dirname, 'templatestory.html'))
        );

// API endpoint to list all articles in generated_news directory
app.get('/api/articles', (req, res) => {
    const directoryPath = path.join(__dirname, 'generated_news');
    
    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            console.error('Error reading generated_news directory:', err);
            return res.status(500).json({ error: 'Failed to read articles directory' });
        }
        
        // Filter only .html files and extract slug (filename without .html)
        const articles = files
            .filter(file => file.endsWith('.html'))
            .map(file => ({
                slug: file.slice(0, -5), // Remove .html extension
                title: file.slice(0, -5).replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), // Convert slug to title
                url: `/news/${file.slice(0, -5)}`
            }))
            .sort((a, b) => b.slug.localeCompare(a.slug)); // Sort by slug (newest first)
        
        res.json(articles);
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
