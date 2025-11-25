
const express = require('express');
const path = require('path');
const fs = require('fs');
const submissionsRouter = require('./submissions');
const storage = require('./storage');
const { router: adminRouter } = require('./admin');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(__dirname));

// Initialize database if using database storage
storage.initDatabase().catch(err => console.error('Database initialization failed:', err));

// Serve static files from generated_news directory
app.use('/news', express.static(path.join(__dirname, 'generated_news')));

// Handle article pages without .html extension
app.get('/news/:slug', async (req, res) => {
    const slug = req.params.slug;
    
    if (storage.STORAGE_MODE === 'database') {
        try {
            const article = await storage.getArticle(slug);
            if (article) {
                res.send(article.content);
            } else {
                res.status(404).send('Article not found');
            }
        } catch (error) {
            res.status(500).send('Error retrieving article');
        }
    } else {
        const filePath = path.join(__dirname, 'generated_news', `${slug}.html`);
        fs.access(filePath, fs.constants.F_OK, (err) => {
            if (err) {
                res.status(404).send('Article not found');
            } else {
                res.sendFile(filePath);
            }
        });
    }
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

// API endpoint to list all articles
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await storage.getAllArticles();
        const articlesWithUrls = articles.map(article => ({
            ...article,
            url: `/news/${article.slug}`
        }));
        res.json(articlesWithUrls);
    } catch (error) {
        console.error('Error reading articles:', error);
        res.status(500).json({ error: 'Failed to read articles' });
    }
});

// API endpoint to delete an article
app.delete('/api/articles/:slug', async (req, res) => {
    const slug = req.params.slug;
    
    try {
        await storage.deleteArticle(slug);
        res.send(`Article "${slug}" deleted successfully`);
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).send('Error deleting article');
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`Storage mode: ${storage.STORAGE_MODE}`);
});
