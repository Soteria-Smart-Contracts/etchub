# ETC Hub Interaction Design

## User Authentication System
- **Sign Up**: Users create accounts with email, username, and password
- **Sign In**: Secure login with email/username and password
- **JWT Token**: Secure session management with Bearer tokens
- **Password Hashing**: bcrypt for secure password storage

## Blog Post Management
- **Create Post**: Authenticated users can submit blog posts
- **Moderation Queue**: All posts go through admin approval before publishing
- **Post Display**: Published posts appear on news page with author info
- **Post Categories**: Support for different content types (news, tutorials, analysis)

## User Profile System
- **Profile View**: Display user's name, bio, profile picture, and published posts
- **Edit Profile**: Single form to update name, bio, and profile picture
- **Profile Picture**: Upload and display custom avatar images
- **Post History**: Show all posts authored by the user

## API Endpoints
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/posts` - Create new blog post (protected)
- `GET /api/posts` - Get all published posts
- `GET /api/posts/user/:userId` - Get posts by specific user
- `GET /api/posts/pending` - Get pending posts (admin only)
- `PUT /api/posts/:id/approve` - Approve post (admin only)

## Interactive Components
1. **Authentication Forms**: Login/Signup with validation
2. **Blog Post Editor**: Rich text editor for content creation
3. **Profile Management**: Single-page profile editing
4. **Post Moderation**: Admin interface for content approval
5. **Dynamic Content Loading**: Real-time post updates and user interactions