# ETC Hub - Simplified Version

This is a simplified version of the ETC Hub with the following changes:

## Key Changes Made

1. **Removed Authentication**: All authentication logic has been removed
   - No IP whitelisting required
   - Anyone can access the admin panel
   - Anyone can submit articles
   - Anyone can approve/delet articles

2. **Article Submission Workflow**
   - Users can submit articles via the submit form
   - Articles are stored in a temporary submissions queue
   - Admin can approve articles to make them publicly available
   - Approved articles are saved as HTML files in the `generated_news` directory
   - Approved articles are accessible via `/news/{article-name}.html`

3. **Admin Panel**
   - Fully open access - anyone can view the admin panel
   - Can view all submissions
   - Can approve or delete any submission
   - Approving creates a static HTML file in the news directory

## Technical Implementation

### Files Modified:
- `server.js`: Removed IP whitelist middleware and authentication checks
- `submissions.js`: Removed IP whitelist middleware from all endpoints
- `admin.js`: Removed IP whitelist middleware and authentication logic
- `news.html`: Updated to properly display generated news articles
- `submit.html`: Fixed form submission to match backend expectations

### Directory Structure:
- `generated_news/` - Stores approved articles as static HTML files

## How to Run

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

3. Visit:
   - Main site: http://localhost:5000
   - Admin panel: http://localhost:5000/admin
   - Submit form: http://localhost:5000/submit.html
   - News articles: http://localhost:5000/news