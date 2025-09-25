// Login Page JavaScript
class LoginManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAnimations();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Login form submission
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        
        // Demo account button
        document.getElementById('useDemoBtn').addEventListener('click', () => this.useDemoAccount());
        
        // Form validation
        document.getElementById('email').addEventListener('input', () => this.validateForm());
        document.getElementById('password').addEventListener('input', () => this.validateForm());
    }

    initAnimations() {
        // Animate elements on page load
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        })
        .add({
            targets: '.reveal-text',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(200)
        })
        .add({
            targets: '.auth-card',
            opacity: [0, 1],
            scale: [0.9, 1],
            duration: 600
        }, '-=500');
    }

    checkAuthStatus() {
        // If user is already logged in, redirect to profile
        if (window.etcHub?.user) {
            window.location.href = 'profile.html';
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (!this.validateLoginForm(email, password)) {
            return;
        }

        try {
            this.showLoadingState();
            
            // Try to login with the server
            const response = await this.loginUser(email, password);
            
            if (response.success) {
                showNotification('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1500);
            } else {
                showNotification(response.message || 'Login failed', 'error');
                this.hideLoadingState();
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('An error occurred during login', 'error');
            this.hideLoadingState();
        }
    }

    validateLoginForm(email, password) {
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        // Password validation
        if (password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return false;
        }

        return true;
    }

    async loginUser(email, password) {
        // If ETC Hub API is available, use it
        if (window.etcHub) {
            try {
                const response = await window.etcHub.login(email, password);
                return { success: true, data: response };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }

        // Demo authentication for demonstration
        const demoUsers = {
            'demo@etchub.com': 'demo123',
            'admin@etchub.com': 'admin123'
        };

        if (demoUsers[email] === password) {
            // Create mock user data
            const mockUser = {
                id: email === 'admin@etchub.com' ? 'admin-123' : 'demo-123',
                email: email,
                username: email.split('@')[0],
                name: email === 'admin@etchub.com' ? 'Admin User' : 'Demo User',
                bio: email === 'admin@etchub.com' ? 
                    'Administrator of ETC Hub, passionate about Ethereum Classic and blockchain technology.' :
                    'Ethereum Classic enthusiast exploring the world of decentralized blockchain technology.',
                profilePicture: '/resources/default-avatar.png',
                role: email === 'admin@etchub.com' ? 'admin' : 'user',
                createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days ago
            };

            // Store user data
            const token = this.generateMockToken(mockUser);
            localStorage.setItem('etcHubToken', token);
            localStorage.setItem('etcHubUser', JSON.stringify(mockUser));

            return { success: true, data: { user: mockUser, token } };
        }

        return { success: false, message: 'Invalid email or password' };
    }

    generateMockToken(user) {
        // Simple mock token generation
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        return btoa(JSON.stringify(payload)) + '.' + btoa('mock-signature');
    }

    useDemoAccount() {
        document.getElementById('email').value = 'demo@etchub.com';
        document.getElementById('password').value = 'demo123';
        this.validateForm();
        
        // Auto-submit after a short delay
        setTimeout(() => {
            document.getElementById('loginForm').dispatchEvent(new Event('submit'));
        }, 500);
    }

    validateForm() {
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        
        const isValid = email.length > 0 && password.length >= 6;
        
        if (isValid) {
            loginBtn.disabled = false;
            loginBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            loginBtn.disabled = true;
            loginBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    showLoadingState() {
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Signing In...
        `;
    }

    hideLoadingState() {
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = false;
        loginBtn.innerHTML = 'Sign In';
    }

    // Utility methods
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
            type === 'success' ? 'bg-green-600' : 
            type === 'error' ? 'bg-red-600' : 
            'bg-blue-600'
        } text-white`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animate in
        anime({
            targets: notification,
            translateX: [300, 0],
            opacity: [0, 1],
            duration: 300,
            easing: 'easeOutExpo'
        });
        
        setTimeout(() => {
            anime({
                targets: notification,
                translateX: [0, 300],
                opacity: [1, 0],
                duration: 300,
                easing: 'easeInExpo',
                complete: () => notification.remove()
            });
        }, 5000);
    }
}

// Initialize login manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.loginManager = new LoginManager();
});