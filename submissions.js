
const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Ensure generated_news directory exists
const generatedNewsDir = path.join(__dirname, 'generated_news');
if (!fs.existsSync(generatedNewsDir)) {
    fs.mkdirSync(generatedNewsDir, { recursive: true });
}

// Path to submissions JSON file
const submissionsFilePath = path.join(__dirname, 'submissions.json');

// Load submissions from file or initialize empty array if file doesn't exist
let submissions = [];
if (fs.existsSync(submissionsFilePath)) {
    try {
        const data = fs.readFileSync(submissionsFilePath, 'utf8');
        submissions = JSON.parse(data);
    } catch (error) {
        console.error('Error reading submissions file:', error);
        submissions = [];
    }
}

// Save submissions to file
const saveSubmissions = () => {
    try {
        fs.writeFileSync(submissionsFilePath, JSON.stringify(submissions, null, 2));
    } catch (error) {
        console.error('Error writing to submissions file:', error);
    }
};

// Endpoint for submitting articles
router.post('/submit', (req, res) => {
    const { title, xUsername, content, description } = req.body;
    if (!title || !xUsername || !content) {
        return res.status(400).send('Missing required fields');
    }
    const newSubmission = {
        id: submissions.length + 1,
        title,
        xUsername,
        content,
        description: description || '',
        approved: false
    };
    submissions.push(newSubmission);
    saveSubmissions(); // Save to file
    res.status(201).send('Submission successful');
});

// Endpoint to get all submissions (open access)
router.get('/', (req, res) => {
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

// Endpoint for approving articles (open access)
router.put('/approve/:id', (req, res) => {
    const { id } = req.params;
    const submission = submissions.find(s => s.id == id);
    if (!submission) {
        return res.status(404).send('Submission not found');
    }

    // Mark as approved
    submission.approved = true;

    const templatePath = path.join(__dirname, 'templatestory.html');
    fs.readFile(templatePath, 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Error reading template file');
        }

        const slug = slugify(submission.title);
        const newFilePath = path.join(generatedNewsDir, `${slug}.html`);

        // Convert content to preserve paragraph structure
        // This approach:
        // 1. Splits content by double line breaks (paragraph separators)
        // 2. For each paragraph, replaces single line breaks with <br> tags
        // 3. Wraps each paragraph in <p> tags
        // 4. Preserves empty paragraphs
        const paragraphs = submission.content
            .split(/\n\s*\n/)  // Split by double line breaks (paragraph separators)
            .map(paragraph => {
                // Split paragraph by single line breaks
                const lines = paragraph.split('\n');
                
                // Process each line in the paragraph
                const processedLines = lines.map(line => {
                    // Trim whitespace from line
                    const trimmedLine = line.trim();
                    // Return empty string if line is empty after trimming
                    return trimmedLine;
                }).filter(line => line.length > 0 || line === ''); // Keep empty lines for spacing
                
                // Join lines with <br> tags for single line breaks within paragraph
                // This preserves line breaks within paragraphs
                const paragraphContent = processedLines.join('<br>');
                
                // If paragraph has content, wrap in <p> tags
                if (paragraphContent.length > 0) {
                    return `<p>${paragraphContent}</p>`;
                } else {
                    // Keep empty paragraphs as empty <p> tags
                    return '<p></p>';
                }
            })
            .filter(paragraph => paragraph !== '<p></p>' || paragraph === '<p></p>'); // Keep empty paragraphs
        
        const contentWithParagraphs = paragraphs.join('\n');
        
        const newContent = data
            .replace(/{{TITLE}}/g, submission.title)
            .replace(/{{AUTHOR}}/g, submission.xUsername)
            .replace(/{{CONTENT}}/g, contentWithParagraphs)
            .replace(/{{DESCRIPTION}}/g, submission.description || '');

        fs.writeFile(newFilePath, newContent, 'utf8', (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error saving the new article');
            }
            
            // Remove submission from array after successful article generation
            const index = submissions.findIndex(s => s.id == id);
            if (index !== -1) {
                submissions.splice(index, 1);
                saveSubmissions(); // Save updated submissions array to file
            }
            
            res.send(`Submission approved and article generated at /news/${slug}`);
        });
    });
});

// Endpoint for deleting articles (open access)
router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const index = submissions.findIndex(s => s.id == id);
    if (index === -1) {
        return res.status(404).send('Submission not found');
    }
    submissions.splice(index, 1);
    saveSubmissions(); // Save to file after deletion
    res.send('Submission deleted');
});

module.exports = router;
