
const express = require('express');
const { ipWhitelist } = require('./admin');
const router = express.Router();
const fs = require('fs');
const path = require('path');

let submissions = [];

// Endpoint for submitting articles
router.post('/submit', (req, res) => {
    const { title, xUsername, content } = req.body;
    if (!title || !xUsername || !content) {
        return res.status(400).send('Missing required fields');
    }
    const newSubmission = {
        id: submissions.length + 1,
        title,
        xUsername,
        content,
        approved: false
    };
    submissions.push(newSubmission);
    res.status(201).send('Submission successful');
});

// Endpoint to get all submissions (for admin use)
router.get('/', ipWhitelist, (req, res) => {
    res.json(submissions);
});

// Helper function to create a URL-friendly slug
const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

// Endpoint for approving articles
router.put('/approve/:id', ipWhitelist, (req, res) => {
    const { id } = req.params;
    const submission = submissions.find(s => s.id == id);
    if (!submission) {
        return res.status(404).send('Submission not found');
    }

    submission.approved = true;

    const templatePath = path.join(__dirname, 'templatestory.html');
    fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading template file');
        }

        const slug = slugify(submission.title);
        const newFilePath = path.join(__dirname, 'generated_news', `${slug}.html`);

        const newContent = data
            .replace(/{{TITLE}}/g, submission.title)
            .replace(/{{AUTHOR}}/g, submission.xUsername)
            .replace(/{{CONTENT}}/g, submission.content);

        fs.writeFile(newFilePath, newContent, 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving the new article');
            }
            res.send(`Submission approved and article generated at /generated_news/${slug}.html`);
        });
    });
});

// Endpoint for deleting articles
router.delete('/delete/:id', ipWhitelist, (req, res) => {
    const { id } = req.params;
    const index = submissions.findIndex(s => s.id == id);
    if (index === -1) {
        return res.status(404).send('Submission not found');
    }
    submissions.splice(index, 1);
    res.send('Submission deleted');
});

module.exports = router;
