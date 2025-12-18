
const express = require('express');
const path = require('path');
const fs = require('fs');
const submissionsRouter = require('./submissions');
const storage = require('./storage');
const { metaTags, generateMetaTags } = require('./meta-tags');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to inject meta tags into HTML
function injectMetaTags(html, pageType, customData = {}) {
  // Build absolute URL for images
  const imageUrl = customData.image || metaTags[pageType]?.image || '/resources/hub.jpeg';
  const absoluteImageUrl = imageUrl.startsWith('http') ? imageUrl : `http://${process.env.REPLIT_DOMAINS || 'localhost:5000'}${imageUrl}`;
  
  const metaTags = generateMetaTags(pageType, { ...customData, image: absoluteImageUrl });
  return html.replace('<!-- META_TAGS_PLACEHOLDER -->', metaTags);
}

// Initialize database if using database storage
storage.initDatabase().catch(err => console.error('Database initialization failed:', err));

// Serve static files from news directory
app.use('/news', express.static(path.join(__dirname, 'public', 'news')));

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
        const filePath = path.join(__dirname, 'public', 'news', `${slug}.html`);
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

app.get('/api/admin/dashboard', (req, res) => {
    res.send('Welcome to the admin dashboard');
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/', (req, res) => {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'index.html'), 'utf8');
    res.send(injectMetaTags(html, 'home'));
});

app.get('/news', (req, res) => {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'news.html'), 'utf8');
    res.send(injectMetaTags(html, 'news'));
});

app.get('/submit', (req, res) => {
    const html = fs.readFileSync(path.join(__dirname, 'public', 'submit.html'), 'utf8');
    res.send(injectMetaTags(html, 'submit'));
});

app.get('/templatestory', (req, res) =>
    res.sendFile(path.join(__dirname, 'templates', 'templatestory.html'))
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
