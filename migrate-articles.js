const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrateArticles() {
    const dir = path.join(__dirname, 'generated_news');
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
    
    for (const file of files) {
        const slug = file.slice(0, -5);
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        
        const titleMatch = content.match(/<h1 class="text-4xl lg:text-5xl font-bold orbitron mb-4 copper-gradient">(.*?)<\/h1>/);
        const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ');
        
        const authorMatch = content.match(/<div class="text-gray-400 text-sm">\s*<span>By\s*(.*?)<\/span>\s*<\/div>/);
        const author = authorMatch ? authorMatch[1] : 'Admin User';
        
        const descriptionMatch = content.match(/<div class="mb-8">\s*<p class="text-gray-300 text-lg">(.*?)<\/p>\s*<\/div>/);
        const description = descriptionMatch ? descriptionMatch[1] : '';
        
        try {
            await pool.query(
                'INSERT INTO articles (slug, title, author, description, content, category) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (slug) DO NOTHING',
                [slug, title, author, description, content, 'news']
            );
            console.log(`Migrated: ${slug}`);
        } catch (err) {
            console.error(`Error migrating ${slug}:`, err.message);
        }
    }
    
    await pool.end();
    console.log('Migration complete!');
}

migrateArticles().catch(err => {
    console.error('Migration failed:', err);
    process.exit(1);
});
