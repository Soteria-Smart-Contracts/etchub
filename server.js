const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('public'));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}-${file.originalname}`;
        cb(null, uniqueName);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// In-memory data storage (replace with database in production)
let users = [];
let posts = [];
let pendingPosts = [];

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

// Admin middleware
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Routes

// Root route
app.get('/', (req, res) => {
    res.json({ message: 'ETC Hub API Server Running' });
});

// User Registration
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, username, password, name } = req.body;
        
        // Validation
        if (!email || !username || !password || !name) {
            return res.status(400).json({ error: 'All fields are required' });
        }
        
        // Check if user already exists
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create user
        const user = {
            id: uuidv4(),
            email,
            username,
            password: hashedPassword,
            name,
            bio: '',
            profilePicture: '/resources/default-avatar.png',
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        users.push(user);
        
        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Return user without password
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.status(201).json({
            message: 'User created successfully',
            token,
            user: userResponse
        });
        
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Validation
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        
        // Find user
        const user = users.find(u => u.email === email);
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }
        
        // Generate JWT
        const token = jwt.sign(
            { userId: user.id, username: user.username, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        // Return user without password
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json({
            message: 'Login successful',
            token,
            user: userResponse
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    try {
        const user = users.find(u => u.id === req.user.userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Return user without password
        const userResponse = { ...user };
        delete userResponse.password;
        
        res.json(userResponse);
    } catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update User Profile
app.put('/api/auth/profile', authenticateToken, upload.single('profilePicture'), async (req, res) => {
    try {
        const { name, bio } = req.body;
        const userIndex = users.findIndex(u => u.id === req.user.userId);
        
        if (userIndex === -1) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        // Update fields
        if (name) users[userIndex].name = name;
        if (bio !== undefined) users[userIndex].bio = bio;
        
        // Handle profile picture upload
        if (req.file) {
            users[userIndex].profilePicture = `/uploads/${req.file.filename}`;
        }
        
        // Return updated user without password
        const userResponse = { ...users[userIndex] };
        delete userResponse.password;
        
        res.json({
            message: 'Profile updated successfully',
            user: userResponse
        });
        
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create Blog Post
app.post('/api/posts', authenticateToken, async (req, res) => {
    try {
        const { title, content, category = 'general' } = req.body;
        
        // Validation
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required' });
        }
        
        const post = {
            id: uuidv4(),
            title,
            content,
            category,
            authorId: req.user.userId,
            authorName: users.find(u => u.id === req.user.userId)?.name || 'Unknown',
            status: 'pending', // All posts go to moderation queue
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        pendingPosts.push(post);
        
        res.status(201).json({
            message: 'Post submitted for moderation',
            post
        });
        
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get All Published Posts
app.get('/api/posts', (req, res) => {
    try {
        const publishedPosts = posts.filter(post => post.status === 'published')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(publishedPosts);
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Posts by User
app.get('/api/posts/user/:userId', (req, res) => {
    try {
        const userId = req.params.userId;
        const userPosts = posts.filter(post => post.authorId === userId && post.status === 'published')
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        res.json(userPosts);
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Pending Posts (Admin only)
app.get('/api/posts/pending', authenticateToken, requireAdmin, (req, res) => {
    try {
        res.json(pendingPosts);
    } catch (error) {
        console.error('Get pending posts error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Approve Post (Admin only)
app.put('/api/posts/:id/approve', authenticateToken, requireAdmin, (req, res) => {
    try {
        const postId = req.params.id;
        const postIndex = pendingPosts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        // Move post from pending to published
        const post = pendingPosts[postIndex];
        post.status = 'published';
        post.updatedAt = new Date().toISOString();
        
        posts.push(post);
        pendingPosts.splice(postIndex, 1);
        
        res.json({ message: 'Post approved successfully', post });
        
    } catch (error) {
        console.error('Approve post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Reject Post (Admin only)
app.delete('/api/posts/:id/reject', authenticateToken, requireAdmin, (req, res) => {
    try {
        const postId = req.params.id;
        const postIndex = pendingPosts.findIndex(p => p.id === postId);
        
        if (postIndex === -1) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        pendingPosts.splice(postIndex, 1);
        
        res.json({ message: 'Post rejected successfully' });
        
    } catch (error) {
        console.error('Reject post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Single Post
app.get('/api/posts/:id', (req, res) => {
    try {
        const postId = req.params.id;
        const post = posts.find(p => p.id === postId && p.status === 'published');
        
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        
        res.json(post);
    } catch (error) {
        console.error('Get single post error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    console.error('Unhandled error:', error);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`ETC Hub server running on port ${PORT}`);
    
    // Create admin user for testing
    const adminExists = users.find(u => u.username === 'admin');
    if (!adminExists) {
        const adminUser = {
            id: uuidv4(),
            email: 'admin@etchub.com',
            username: 'admin',
            password: bcrypt.hashSync('admin123', 10),
            name: 'ETC Hub Admin',
            bio: 'Administrator of ETC Hub',
            profilePicture: '/resources/default-avatar.png',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        users.push(adminUser);
        console.log('Admin user created: admin@etchub.com / admin123');
    }
});