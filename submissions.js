
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
        category: category || 'news', // Default to 'news' if not provided
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

    const slug = slugify(submission.title);
    const newFilePath = path.join(generatedNewsDir, `${slug}.html`);

    // Robust paragraph handling: preserve intentional spacing and structure
    // Split content by double line breaks to identify paragraphs
    const paragraphs = submission.content
        .split(/\n\s*\n/)
        .map(paragraph => paragraph.trim())
        .filter(paragraph => paragraph.length > 0);
    
    // Convert each paragraph to HTML <p> tags
    const contentWithParagraphs = paragraphs
        .map(paragraph => {
            // Handle line breaks within paragraphs (single line breaks)
            // Replace single line breaks with <br> tags
            const formattedParagraph = paragraph
                .replace(/\n/g, '<br>')
                .replace(/&/g, '&')
                .replace(/</g, '<')
                .replace(/>/g, '>')
                .replace(/"/g, '"')
                .replace(/'/g, '&#x27;');
            
            return `<p>${formattedParagraph}</p>`;
        })
        .join('\n');
    
    // Create HTML content directly without template file
    const newContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${submission.title} - ETC Hub</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --primary-teal: #0D4F4C;
            --secondary-copper: #B87333;
            --accent-gold: #D4AF37;
            --bg-navy: #0A0E1A;
            --text-light: #E8E8E8;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, var(--bg-navy) 0%, var(--primary-teal) 100%);
            min-height: 100vh;
            color: var(--text-light);
        }
        
        .orbitron {
            font-family: 'Orbitron', monospace;
        }
        
        .copper-gradient {
            background: linear-gradient(45deg, var(--secondary-copper), var(--accent-gold));
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .nav-link {
            position: relative;
            transition: all 0.3s ease;
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--accent-gold);
            transition: width 0.3s ease;
        }
        
        .nav-link:hover::after {
            width: 100%;
        }
        
        .article-content a {
            color: var(--accent-gold);
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <!-- Navigation -->
    <nav class="fixed top-0 w-full z-50 bg-black bg-opacity-20 backdrop-blur-md border-b border-opacity-20 border-gray-600">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <a href="/" class="text-2xl font-bold orbitron copper-gradient">ETC Hub</a>
                </div>
                <div class="hidden md:block">
                    <div class="ml-10 flex items-baseline space-x-8">
                        <a href="/" class="nav-link text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">Home</a>
                        <a href="/news" class="nav-link text-gray-300 hover:text-white px-3 py-2 text-sm font-medium">News</a>
                    </div>
                </div>
            </div>
        </div>
    </nav>

    <!-- Article Section -->
    <section class="pt-24 pb-12">
        <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <article>
                <header class="mb-8">
                    <h1 class="text-4xl lg:text-5xl font-bold orbitron mb-4 copper-gradient">${submission.title}</h1>
                    <div class="text-gray-400 text-sm">
                        <span>By ${submission.xUsername}</span>
                    </div>
                </header>
                
                <div class="mb-8">
                    <p class="text-gray-300 text-lg">${submission.description || ''}</p>
                </div>
                
                <div class="mb-6">
                    <span class="category-badge">${submission.category || 'news'}</span>
                </div>

                <div class="prose prose-invert lg:prose-xl max-w-none article-content">
                    ${contentWithParagraphs}
                </div>
            </article>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-black bg-opacity-50 py-12 mt-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center">
                <h3 class="text-2xl font-bold orbitron copper-gradient mb-4">ETC Hub</h3>
                <p class="text-gray-400 mb-6">Building the future of Ethereum Classic together</p>
                <div class="border-t border-gray-700 pt-8">
                    <p class="text-gray-400 text-sm">
                        © 2024 ETC Hub. All rights reserved. Built for the Ethereum Classic community.
                    </p>
                </div>
            </div>
        </div>
    </footer>
</body>
</html>`;

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
