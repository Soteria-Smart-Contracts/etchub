# ETC Hub - Ethereum Classic Community Platform

A full-stack web application for the Ethereum Classic community, featuring secure authentication, blog management, user profiles, and a modern crypto-themed design.

## Features

### 🔐 Secure Authentication
- JWT-based authentication system
- Password hashing with bcrypt
- Secure API endpoints with middleware protection
- User registration and login with validation

### 📝 Blog & Content Management
- Create and publish blog posts
- Moderation queue for content approval
- Category-based post organization
- Rich text content with search functionality

### 👤 User Profiles
- Editable user profiles with avatar upload
- Personal bio and display name customization
- User activity tracking and statistics
- My posts section with management tools

### 🎨 Modern Design
- Gradient backgrounds with crypto aesthetic
- Responsive design for all devices
- Smooth animations and transitions
- Professional typography and color scheme

### 🛠️ Technical Stack
- **Frontend**: HTML5, CSS3 (Tailwind), JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Authentication**: JWT tokens, bcrypt hashing
- **Styling**: Custom CSS with Tailwind framework
- **Animations**: Anime.js for smooth transitions
- **Visual Effects**: p5.js for particle systems

## Project Structure

```
etc-hub/
├── server.js              # Main server file
├── package.json           # Node.js dependencies
├── main.js               # Core JavaScript functionality
├── index.html            # Landing page
├── news.html             # News/blog page
├── profile.html          # User profile page
├── login.html            # Login page
├── signup.html           # Registration page
├── login.js              # Login functionality
├── signup.js             # Registration functionality
├── news.js               # News page functionality
├── profile.js            # Profile page functionality
├── resources/            # Images and assets
│   ├── hero-bg.png       # Hero background image
│   ├── etc-coins.png     # ETC themed image
│   └── default-avatar.png # Default user avatar
└── README.md             # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation Steps

1. **Clone or download the project files**
   ```bash
   # If using git
   git clone <repository-url>
   cd etc-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The server will automatically create a demo admin account

### Default Accounts

**Admin Account:**
- Email: `admin@etchub.com`
- Password: `admin123`

**Demo Account:**
- Email: `demo@etchub.com`
- Password: `demo123`

## Usage Guide

### Getting Started
1. Visit the homepage to see the landing page with animated backgrounds
2. Click "Get Started" to access authentication options
3. Choose "Create Account" for new users or "Sign In" for existing accounts

### Creating an Account
1. Fill in the registration form with:
   - Full name (minimum 2 characters)
   - Username (3-20 characters, alphanumeric and underscores)
   - Valid email address
   - Strong password (minimum 6 characters)
2. Accept the terms and conditions
3. Click "Create Account" to register

### Using the Platform

#### News & Blog Section
- Browse published posts in the News section
- Use search and category filters to find specific content
- Create new posts (requires authentication)
- All posts go through moderation before publication

#### Profile Management
- Access your profile by clicking your username
- Edit profile information (name, bio, avatar)
- Upload custom profile pictures
- View your published posts and activity history

#### Post Creation
1. Navigate to the News section
2. Click "Create Post" button
3. Fill in the post form:
   - Title (required)
   - Category (News, Analysis, Tutorial, Mining, General)
   - Content (required)
4. Submit for moderation

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)

### Posts
- `GET /api/posts` - Get all published posts
- `POST /api/posts` - Create new post (protected)
- `GET /api/posts/user/:userId` - Get posts by user
- `GET /api/posts/pending` - Get pending posts (admin only)
- `PUT /api/posts/:id/approve` - Approve post (admin only)

## Security Features

- **Password Security**: All passwords are hashed using bcrypt
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive form validation on both client and server
- **File Upload Security**: Image file type and size restrictions
- **CORS Protection**: Cross-origin resource sharing configured
- **Session Management**: Secure token storage and expiration

## Design Features

### Visual Effects
- Animated gradient backgrounds
- Particle system on homepage
- Smooth scroll animations
- Hover effects on interactive elements
- Loading states with skeleton screens

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Optimized touch interactions
- Scalable typography
- Adaptive navigation

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Optimizations

- Optimized images with appropriate formats
- CSS animations using transform and opacity
- Debounced search functionality
- Lazy loading for content sections
- Minimal external dependencies

## Development

### Running in Development Mode
```bash
npm run dev
```

### Adding New Features
1. Create appropriate HTML structure
2. Add CSS styling following the design system
3. Implement JavaScript functionality
4. Add API endpoints if needed
5. Test across different devices and browsers

### Customization
- Modify color scheme in CSS custom properties
- Update animations in respective JavaScript files
- Add new categories in the post creation form
- Customize the particle system in main.js

## Troubleshooting

### Common Issues
1. **Server won't start**: Check if port 3000 is available
2. **Images not loading**: Ensure resources folder exists
3. **Login issues**: Verify user credentials or try demo account
4. **Post creation fails**: Check if user is authenticated

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG=true npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues, feature requests, or questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the code documentation

---

**Built with ❤️ for the Ethereum Classic Community**