
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const storage = require('./storage');

// Ensure generated_news directory exists (for local storage)
const generatedNewsDir = path.join(__dirname, 'generated_news');
if (storage.STORAGE_MODE === 'local' && !fs.existsSync(generatedNewsDir)) {
    fs.mkdirSync(generatedNewsDir, { recursive: true });
}

// Load submissions based on storage mode
let submissions = [];
const loadSubmissions = async () => {
    submissions = await storage.loadSubmissions();
};

loadSubmissions();

// Helper function to create a URL-friendly slug
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

// Endpoint for submitting articles
router.post('/submit', async (req, res) => {
    const { title, xUsername, content, description, category } = req.body;
    if (!title || !xUsername || !content) {
        return res.status(400).send('Missing required fields');
    }
    
    const newSubmission = {
        id: submissions.length + 1,
        title,
        xUsername,
        content,
        description: description || '',
        category: 'news',
        approved: false
    };
    
    try {
        if (storage.STORAGE_MODE === 'database') {
            const id = await storage.saveSubmission(newSubmission);
            newSubmission.id = id;
        } else {
            await storage.saveSubmission(newSubmission);
        }
        submissions.push(newSubmission);
        res.status(201).send('Submission successful');
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).send('Error saving submission');
    }
});

// Endpoint to get all submissions
router.get('/', async (req, res) => {
    try {
        const currentSubmissions = await storage.loadSubmissions();
        res.json(currentSubmissions);
    } catch (error) {
        console.error('Error loading submissions:', error);
        res.status(500).json({ error: 'Error loading submissions' });
    }
});

// Endpoint for approving articles
router.put('/approve/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const allSubmissions = await storage.loadSubmissions();
        const submission = allSubmissions.find(s => s.id == id);
        
        if (!submission) {
            return res.status(404).send('Submission not found');
        }

        const templatePath = path.join(__dirname, 'templatestory.html');
        const data = fs.readFileSync(templatePath, 'utf8');

        const slug = slugify(submission.title);
        
        // Process content into paragraphs
        const paragraphs = submission.content
            .split(/\n\s*\n/)
            .map(paragraph => {
                const lines = paragraph.split('\n');
                const processedLines = lines.map(line => line.trim()).filter(line => line.length > 0);
                const paragraphContent = processedLines.join('<br>');
                return paragraphContent.length > 0 ? `<p>${paragraphContent}</p>` : '';
            })
            .filter(p => p.length > 0);
        
        const contentWithParagraphs = paragraphs.join('\n');
        
        const newContent = data
            .replace(/{{TITLE}}/g, submission.title)
            .replace(/{{AUTHOR}}/g, submission.xUsername)
            .replace(/{{CONTENT}}/g, contentWithParagraphs)
            .replace(/{{DESCRIPTION}}/g, submission.description || '')
            .replace(/{{CATEGORY}}/g, 'news');

        // Save article
        await storage.saveArticle(slug, submission.title, submission.xUsername, submission.description || '', newContent, 'news');

        // Update submission status and remove from submissions
        await storage.deleteSubmission(id);
        
        // Reload submissions
        submissions = await storage.loadSubmissions();
        
        res.send(`Submission approved and article generated at /news/${slug}`);
    } catch (error) {
        console.error('Error approving submission:', error);
        res.status(500).send('Error approving submission');
    }
});

// Endpoint for deleting submissions
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        await storage.deleteSubmission(id);
        submissions = await storage.loadSubmissions();
        res.send('Submission deleted');
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).send('Error deleting submission');
    }
});

module.exports = router;
