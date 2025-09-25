// ETC Hub Main JavaScript
class ETCHub {
    constructor() {
        this.token = localStorage.getItem('etcHubToken');
        this.user = JSON.parse(localStorage.getItem('etcHubUser') || 'null');
        this.apiBase = 'http://localhost:3000/api';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initAnimations();
        this.initParticleSystem();
        this.updateAuthUI();
        this.animateStats();
        this.setupScrollAnimations();
    }

    setupEventListeners() {
        // Auth buttons
        document.getElementById('authBtn')?.addEventListener('click', () => this.showAuthModal());
        document.getElementById('joinBtn')?.addEventListener('click', () => this.showAuthModal());
        document.getElementById('closeModal')?.addEventListener('click', () => this.hideAuthModal());
        document.getElementById('loginBtn')?.addEventListener('click', () => this.showLoginForm());
        document.getElementById('signupBtn')?.addEventListener('click', () => this.showSignupForm());

        // Mobile menu
        document.getElementById('mobileMenuBtn')?.addEventListener('click', () => this.toggleMobileMenu());

        // Smooth scrolling for navigation links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });

        // Close modal on outside click
        document.getElementById('authModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'authModal') {
                this.hideAuthModal();
            }
        });
    }

    initAnimations() {
        // Animate hero text
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 1000
        })
        .add({
            targets: '.reveal-text',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(200)
        });

        // Floating animation for hero image
        anime({
            targets: '.floating-animation',
            translateY: [-10, 10],
            duration: 3000,
            direction: 'alternate',
            loop: true,
            easing: 'easeInOutSine'
        });
    }

    initParticleSystem() {
        const canvas = document.getElementById('particleCanvas');
        if (!canvas) return;

        let particles = [];
        let mouse = { x: 0, y: 0 };
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const createParticles = () => {
            particles = [];
            const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
            
            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    radius: Math.random() * 2 + 1,
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        };

        const updateParticles = () => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;

                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            });
        };

        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw connections
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < 100) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(212, 175, 55, ${0.1 * (1 - distance / 100)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.stroke();
                    }
                });
            });

            // Draw particles
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(184, 115, 51, ${particle.opacity})`;
                ctx.fill();
            });
        };

        const animate = () => {
            updateParticles();
            drawParticles();
            requestAnimationFrame(animate);
        };

        // Mouse interaction
        canvas.addEventListener('mousemove', (e) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        });

        resizeCanvas();
        createParticles();
        animate();

        window.addEventListener('resize', () => {
            resizeCanvas();
            createParticles();
        });
    }

    animateStats() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = entry.target;
                    const finalValue = parseInt(target.dataset.count);
                    
                    anime({
                        targets: target,
                        innerHTML: [0, finalValue],
                        duration: 2000,
                        easing: 'easeOutExpo',
                        round: 1
                    });
                    
                    observer.unobserve(target);
                }
            });
        });

        document.querySelectorAll('[data-count]').forEach(el => {
            observer.observe(el);
        });
    }

    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.reveal-text').forEach(el => {
            observer.observe(el);
        });
    }

    showAuthModal() {
        document.getElementById('authModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideAuthModal() {
        document.getElementById('authModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    showLoginForm() {
        this.hideAuthModal();
        // Redirect to login page or show inline form
        window.location.href = 'login.html';
    }

    showSignupForm() {
        this.hideAuthModal();
        // Redirect to signup page or show inline form
        window.location.href = 'signup.html';
    }

    toggleMobileMenu() {
        // Mobile menu implementation
        console.log('Mobile menu toggled');
    }

    updateAuthUI() {
        const authBtn = document.getElementById('authBtn');
        if (this.user && authBtn) {
            authBtn.textContent = 'Dashboard';
            authBtn.onclick = () => window.location.href = 'profile.html';
        }
    }

    async apiRequest(endpoint, options = {}) {
        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(`${this.apiBase}${endpoint}`, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    login(email, password) {
        return this.apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        }).then(data => {
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('etcHubToken', this.token);
            localStorage.setItem('etcHubUser', JSON.stringify(this.user));
            this.updateAuthUI();
            return data;
        });
    }

    signup(userData) {
        return this.apiRequest('/auth/signup', {
            method: 'POST',
            body: JSON.stringify(userData)
        }).then(data => {
            this.token = data.token;
            this.user = data.user;
            localStorage.setItem('etcHubToken', this.token);
            localStorage.setItem('etcHubUser', JSON.stringify(this.user));
            this.updateAuthUI();
            return data;
        });
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('etcHubToken');
        localStorage.removeItem('etcHubUser');
        this.updateAuthUI();
        window.location.href = 'index.html';
    }

    getProfile() {
        return this.apiRequest('/auth/profile');
    }

    updateProfile(profileData) {
        return this.apiRequest('/auth/profile', {
            method: 'PUT',
            body: JSON.stringify(profileData)
        });
    }

    uploadProfilePicture(file) {
        const formData = new FormData();
        formData.append('profilePicture', file);
        
        return this.apiRequest('/auth/profile', {
            method: 'PUT',
            body: formData,
            headers: {} // Let browser set content-type for multipart
        });
    }

    createPost(postData) {
        return this.apiRequest('/posts', {
            method: 'POST',
            body: JSON.stringify(postData)
        });
    }

    getPosts() {
        return this.apiRequest('/posts');
    }

    getUserPosts(userId) {
        return this.apiRequest(`/posts/user/${userId}`);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    window.etcHub = new ETCHub();
});

// Utility functions
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'success' ? 'bg-green-600' : 
        type === 'error' ? 'bg-red-600' : 
        'bg-blue-600'
    } text-white`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function truncateText(text, maxLength = 150) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ETCHub;
}