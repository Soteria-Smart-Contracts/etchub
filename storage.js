const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Read storage mode from config file (1 = local files, 2 = database)
const getStorageMode = () => {
    try {
        const configPath = path.join(__dirname, 'storage-config.txt');
        const mode = fs.readFileSync(configPath, 'utf8').trim();
        return parseInt(mode) === 2 ? 'database' : 'local';
    } catch (error) {
        console.warn('storage-config.txt not found, defaulting to local storage');
        return 'local';
    }
};

const STORAGE_MODE = getStorageMode();
const DB_POOL = STORAGE_MODE === 'database' ? new Pool({
    connectionString: process.env.DATABASE_URL
}) : null;

// Initialize database schema if using database storage
const initDatabase = async () => {
    if (STORAGE_MODE !== 'database' || !DB_POOL) return;
    
    try {
        await DB_POOL.query(`
            CREATE TABLE IF NOT EXISTS submissions (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                x_username VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                description TEXT,
                category VARCHAR(50) DEFAULT 'news',
                approved BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS articles (
                id SERIAL PRIMARY KEY,
                slug VARCHAR(255) UNIQUE NOT NULL,
                title VARCHAR(255) NOT NULL,
                author VARCHAR(255),
                description TEXT,
                content TEXT NOT NULL,
                category VARCHAR(50) DEFAULT 'news',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
};

// Local file storage functions
const loadSubmissionsLocal = () => {
    const submissionsFilePath = path.join(__dirname, 'submissions.json');
    let submissions = [];
    if (fs.existsSync(submissionsFilePath)) {
        try {
            const data = fs.readFileSync(submissionsFilePath, 'utf8');
            submissions = JSON.parse(data);
        } catch (error) {
            console.error('Error reading submissions file:', error);
        }
    }
    return submissions;
};

const saveSubmissionsLocal = (submissions) => {
    try {
        const submissionsFilePath = path.join(__dirname, 'submissions.json');
        fs.writeFileSync(submissionsFilePath, JSON.stringify(submissions, null, 2));
    } catch (error) {
        console.error('Error writing to submissions file:', error);
    }
};

// Database storage functions
const loadSubmissionsDatabase = async () => {
    try {
        const result = await DB_POOL.query('SELECT id, title, x_username as "xUsername", content, description, category, approved FROM submissions ORDER BY id DESC');
        return result.rows;
    } catch (error) {
        console.error('Error loading submissions from database:', error);
        return [];
    }
};

const saveSubmissionDatabase = async (submission) => {
    try {
        const result = await DB_POOL.query(
            'INSERT INTO submissions (title, x_username, content, description, category, approved) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [submission.title, submission.xUsername, submission.content, submission.description, submission.category, submission.approved]
        );
        return result.rows[0].id;
    } catch (error) {
        console.error('Error saving submission to database:', error);
        throw error;
    }
};

const deleteSubmissionDatabase = async (id) => {
    try {
        await DB_POOL.query('DELETE FROM submissions WHERE id = $1', [id]);
    } catch (error) {
        console.error('Error deleting submission from database:', error);
        throw error;
    }
};

const updateSubmissionDatabase = async (id, approved) => {
    try {
        const result = await DB_POOL.query(
            'UPDATE submissions SET approved = $1 WHERE id = $2 RETURNING *',
            [approved, id]
        );
        return result.rows[0];
    } catch (error) {
        console.error('Error updating submission in database:', error);
        throw error;
    }
};

// Article storage functions for database
const saveArticleDatabase = async (slug, title, author, description, content, category) => {
    try {
        await DB_POOL.query(
            'INSERT INTO articles (slug, title, author, description, content, category) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (slug) DO UPDATE SET content = $5, title = $2, author = $3',
            [slug, title, author, description, content, category]
        );
    } catch (error) {
        console.error('Error saving article to database:', error);
        throw error;
    }
};

const getArticleDatabase = async (slug) => {
    try {
        const result = await DB_POOL.query('SELECT * FROM articles WHERE slug = $1', [slug]);
        return result.rows[0] || null;
    } catch (error) {
        console.error('Error retrieving article from database:', error);
        return null;
    }
};

const getAllArticlesDatabase = async () => {
    try {
        const result = await DB_POOL.query('SELECT slug, title, author, description, category FROM articles ORDER BY created_at DESC');
        return result.rows;
    } catch (error) {
        console.error('Error retrieving articles from database:', error);
        return [];
    }
};

const deleteArticleDatabase = async (slug) => {
    try {
        await DB_POOL.query('DELETE FROM articles WHERE slug = $1', [slug]);
    } catch (error) {
        console.error('Error deleting article from database:', error);
        throw error;
    }
};

module.exports = {
    STORAGE_MODE,
    initDatabase,
    
    // Submissions
    loadSubmissions: STORAGE_MODE === 'database' ? loadSubmissionsDatabase : loadSubmissionsLocal,
    saveSubmission: STORAGE_MODE === 'database' ? saveSubmissionDatabase : (sub) => {
        const submissions = loadSubmissionsLocal();
        submissions.push(sub);
        saveSubmissionsLocal(submissions);
        return sub.id;
    },
    deleteSubmission: STORAGE_MODE === 'database' ? deleteSubmissionDatabase : (id) => {
        const submissions = loadSubmissionsLocal();
        const index = submissions.findIndex(s => s.id == id);
        if (index !== -1) submissions.splice(index, 1);
        saveSubmissionsLocal(submissions);
    },
    updateSubmission: STORAGE_MODE === 'database' ? updateSubmissionDatabase : (id, approved) => {
        const submissions = loadSubmissionsLocal();
        const submission = submissions.find(s => s.id == id);
        if (submission) submission.approved = approved;
        saveSubmissionsLocal(submissions);
        return submission;
    },
    
    // Articles
    saveArticle: STORAGE_MODE === 'database' ? saveArticleDatabase : (slug, title, author, description, content, category) => {
        const dir = path.join(__dirname, 'generated_news');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, `${slug}.html`), content);
    },
    getArticle: STORAGE_MODE === 'database' ? getArticleDatabase : (slug) => {
        const filePath = path.join(__dirname, 'generated_news', `${slug}.html`);
        if (fs.existsSync(filePath)) {
            return { slug, content: fs.readFileSync(filePath, 'utf8') };
        }
        return null;
    },
    getAllArticles: STORAGE_MODE === 'database' ? getAllArticlesDatabase : () => {
        const dir = path.join(__dirname, 'generated_news');
        if (!fs.existsSync(dir)) return [];
        const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
        return files.map(file => {
            const slug = file.slice(0, -5);
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const titleMatch = content.match(/<h1 class="text-4xl lg:text-5xl font-bold orbitron mb-4 copper-gradient">(.*?)<\/h1>/);
            const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
            const authorMatch = content.match(/<div class="text-gray-400 text-sm">\s*<span>By\s*(.*?)<\/span>\s*<\/div>/);
            const author = authorMatch ? authorMatch[1] : 'Admin User';
            const descriptionMatch = content.match(/<div class="mb-8">\s*<p class="text-gray-300 text-lg">(.*?)<\/p>\s*<\/div>/);
            const description = descriptionMatch ? descriptionMatch[1] : '';
            return { slug, title, author, description, category: 'news', url: `/news/${slug}` };
        });
    },
    deleteArticle: STORAGE_MODE === 'database' ? deleteArticleDatabase : (slug) => {
        fs.unlinkSync(path.join(__dirname, 'generated_news', `${slug}.html`));
    }
};
