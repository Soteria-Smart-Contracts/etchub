// Signup Page JavaScript
class SignupManager {
    constructor() {
        this.passwordStrength = 0;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAnimations();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Form submission
        document.getElementById('signupForm').addEventListener('submit', (e) => this.handleSignup(e));
        
        // Real-time validation
        document.getElementById('name').addEventListener('input', () => this.validateForm());
        document.getElementById('username').addEventListener('input', () => this.validateForm());
        document.getElementById('email').addEventListener('input', () => this.validateForm());
        document.getElementById('password').addEventListener('input', () => this.validatePassword());
        document.getElementById('confirmPassword').addEventListener('input', () => this.validateForm());
        document.getElementById('terms').addEventListener('change', () => this.validateForm());
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

    async handleSignup(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            username: document.getElementById('username').value.trim(),
            email: document.getElementById('email').value.trim(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value
        };

        if (!this.validateSignupForm(formData)) {
            return;
        }

        try {
            this.showLoadingState();
            
            const response = await this.createUser(formData);
            
            if (response.success) {
                showNotification('Account created successfully! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 2000);
            } else {
                showNotification(response.message || 'Signup failed', 'error');
                this.hideLoadingState();
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('An error occurred during signup', 'error');
            this.hideLoadingState();
        }
    }

    validateSignupForm(data) {
        // Name validation
        if (data.name.length < 2) {
            showNotification('Full name must be at least 2 characters', 'error');
            return false;
        }

        // Username validation
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
        if (!usernameRegex.test(data.username)) {
            showNotification('Username must be 3-20 characters, alphanumeric and underscores only', 'error');
            return false;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showNotification('Please enter a valid email address', 'error');
            return false;
        }

        // Password validation
        if (data.password.length < 6) {
            showNotification('Password must be at least 6 characters', 'error');
            return false;
        }

        if (data.password !== data.confirmPassword) {
            showNotification('Passwords do not match', 'error');
            return false;
        }

        // Password strength check
        if (this.passwordStrength < 2) {
            showNotification('Please choose a stronger password', 'error');
            return false;
        }

        // Terms acceptance
        if (!document.getElementById('terms').checked) {
            showNotification('Please accept the terms and conditions', 'error');
            return false;
        }

        return true;
    }

    validatePassword() {
        const password = document.getElementById('password').value;
        const strengthIndicator = document.getElementById('passwordStrength');
        const hintText = document.getElementById('passwordHint');
        
        let strength = 0;
        let feedback = [];

        // Length check
        if (password.length >= 6) strength++;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;

        // Character variety checks
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;

        // Update visual indicator
        strengthIndicator.className = 'password-strength ';
        if (strength <= 2) {
            strengthIndicator.className += 'strength-weak';
            hintText.textContent = 'Password is weak';
            hintText.className = 'text-xs text-red-400 mt-1';
        } else if (strength <= 4) {
            strengthIndicator.className += 'strength-medium';
            hintText.textContent = 'Password is medium strength';
            hintText.className = 'text-xs text-yellow-400 mt-1';
        } else {
            strengthIndicator.className += 'strength-strong';
            hintText.textContent = 'Password is strong';
            hintText.className = 'text-xs text-green-400 mt-1';
        }

        this.passwordStrength = strength;
        this.validateForm();
    }

    validateForm() {
        const name = document.getElementById('name').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const terms = document.getElementById('terms').checked;
        const signupBtn = document.getElementById('signupBtn');

        const isValid = 
            name.length >= 2 &&
            username.length >= 3 &&
            email.length > 0 &&
            password.length >= 6 &&
            confirmPassword === password &&
            terms &&
            this.passwordStrength >= 2;

        if (isValid) {
            signupBtn.disabled = false;
            signupBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        } else {
            signupBtn.disabled = true;
            signupBtn.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    async createUser(data) {
        // If ETC Hub API is available, use it
        if (window.etcHub) {
            try {
                const response = await window.etcHub.signup({
                    name: data.name,
                    username: data.username,
                    email: data.email,
                    password: data.password
                });
                return { success: true, data: response };
            } catch (error) {
                return { success: false, message: error.message };
            }
        }

        // Mock user creation for demonstration
        const mockUser = {
            id: 'user-' + Date.now(),
            email: data.email,
            username: data.username,
            name: data.name,
            bio: '',
            profilePicture: '/resources/default-avatar.png',
            role: 'user',
            createdAt: new Date().toISOString()
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store user data
        const token = this.generateMockToken(mockUser);
        localStorage.setItem('etcHubToken', token);
        localStorage.setItem('etcHubUser', JSON.stringify(mockUser));

        return { success: true, data: { user: mockUser, token } };
    }

    generateMockToken(user) {
        const payload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
        };
        
        return btoa(JSON.stringify(payload)) + '.' + btoa('mock-signature');
    }

    showLoadingState() {
        const signupBtn = document.getElementById('signupBtn');
        signupBtn.disabled = true;
        signupBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Creating Account...
        `;
    }

    hideLoadingState() {
        const signupBtn = document.getElementById('signupBtn');
        signupBtn.disabled = false;
        signupBtn.innerHTML = 'Create Account';
    }
}

// Utility function for notifications (if not already defined)
if (typeof showNotification === 'undefined') {
    function showNotification(message, type = 'info') {
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

// Initialize signup manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.signupManager = new SignupManager();
});