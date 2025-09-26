// Profile Page JavaScript
class ProfileManager {
    constructor() {
        this.currentTab = 'posts';
        this.userPosts = [];
        this.isEditing = false;
        this.init();
    }

    init() {
        this.checkAuth();
        this.setupEventListeners();
        this.loadUserProfile();
        this.loadUserPosts();
    }

    checkAuth() {
        if (!window.etcHub?.user) {
            showNotification('Please sign in to view your profile', 'error');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
            return false;
        }
        return true;
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Edit profile
        document.getElementById('editProfileBtn')?.addEventListener('click', () => this.toggleEditMode());
        document.getElementById('avatarInput')?.addEventListener('change', (e) => this.handleAvatarUpload(e));
        document.getElementById('saveSettings')?.addEventListener('click', () => this.saveProfile());
        document.getElementById('cancelSettings')?.addEventListener('click', () => this.cancelEdit());

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());

        // Avatar upload
        document.querySelector('.avatar-upload')?.addEventListener('click', () => {
            document.getElementById('avatarInput').click();
        });
    }

    async loadUserProfile() {
        if (!window.etcHub?.user) return;

        try {
            const profile = await window.etcHub.getProfile();
            this.displayProfile(profile);
            this.populateSettingsForm(profile);
        } catch (error) {
            console.error('Error loading profile:', error);
            showNotification('Failed to load profile', 'error');
        }
    }

    displayProfile(user) {
        // Update profile header
        document.getElementById('profileName').innerHTML = `<span class="copper-gradient">${this.escapeHtml(user.name || user.username)}</span>`;
        document.getElementById('profileEmail').textContent = user.email;
        document.getElementById('profileBio').textContent = user.bio || 'No bio provided yet. Click edit to add your bio.';
        document.getElementById('userName').textContent = user.name || user.username;

        // Update avatar
        if (user.profilePicture && user.profilePicture !== '/resources/default-avatar.png') {
            document.getElementById('profileAvatar').src = user.profilePicture;
            document.getElementById('userAvatar').src = user.profilePicture;
        }

        // Update join date
        if (user.createdAt) {
            const joinDate = new Date(user.createdAt);
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            document.getElementById('joinDate').textContent = `${months[joinDate.getMonth()]} ${joinDate.getFullYear()}`;
        }

        // Update stats
        this.updateStats();
    }

    populateSettingsForm(user) {
        document.getElementById('settingsName').value = user.name || '';
        document.getElementById('settingsUsername').value = user.username || '';
        document.getElementById('settingsEmail').value = user.email || '';
        document.getElementById('settingsBio').value = user.bio || '';
    }

    async loadUserPosts() {
        if (!window.etcHub?.user) return;

        try {
            if (window.etcHub) {
                // Get user's posts from the API
                const posts = await window.etcHub.getUserPosts(window.etcHub.user.userId);
                this.userPosts = posts || [];
            } else {
                // Mock data for demonstration
                this.userPosts = this.generateMockUserPosts();
            }

            this.displayUserPosts();
        } catch (error) {
            console.error('Error loading user posts:', error);
            this.userPosts = this.generateMockUserPosts();
            this.displayUserPosts();
        }
    }

    generateMockUserPosts() {
        return [
            {
                id: '1',
                title: 'My First ETC Mining Experience',
                content: 'Just started mining Ethereum Classic and wanted to share my initial setup and results. The process was smoother than expected...',
                category: 'mining',
                authorId: window.etcHub?.user?.userId || 'user1',
                authorName: window.etcHub?.user?.name || 'User',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                status: 'published'
            },
            {
                id: '2',
                title: 'ETC Price Analysis - My Perspective',
                content: 'After analyzing the recent market trends, I believe ETC has strong potential for growth in the coming months...',
                category: 'analysis',
                authorId: window.etcHub?.user?.userId || 'user1',
                authorName: window.etcHub?.user?.name || 'User',
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                status: 'published'
            }
        ];
    }

    displayUserPosts() {
        const postsContainer = document.getElementById('userPosts');
        const noPostsMessage = document.getElementById('noPosts');

        if (this.userPosts.length === 0) {
            postsContainer.classList.add('hidden');
            noPostsMessage.classList.remove('hidden');
            return;
        }

        noPostsMessage.classList.add('hidden');
        postsContainer.classList.remove('hidden');

        postsContainer.innerHTML = this.userPosts.map(post => this.createPostItem(post)).join('');

        // Add click listeners
        postsContainer.querySelectorAll('.post-item').forEach((item, index) => {
            item.addEventListener('click', () => this.showPostDetail(this.userPosts[index]));
        });
    }

    createPostItem(post) {
        const formattedDate = this.formatDate(post.createdAt);
        const excerpt = this.createExcerpt(post.content, 200);

        return `
            <div class="post-item p-6 rounded-2xl cursor-pointer">
                <div class="flex items-center justify-between mb-4">
                    <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-copper to-gold text-white">
                        ${this.capitalizeFirst(post.category)}
                    </span>
                    <div class="flex items-center space-x-2 text-sm text-gray-400">
                        <span>${formattedDate}</span>
                        <span class="text-green-400">● Published</span>
                    </div>
                </div>
                
                <h3 class="text-xl font-semibold mb-3 text-white hover:text-yellow-400 transition-colors">
                    ${this.escapeHtml(post.title)}
                </h3>
                
                <p class="text-gray-400 mb-4 leading-relaxed">
                    ${this.escapeHtml(excerpt)}
                </p>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <button class="text-yellow-400 hover:text-yellow-300 font-medium text-sm">
                            View Post
                        </button>
                        <button class="text-gray-400 hover:text-white text-sm">
                            Edit
                        </button>
                        <button class="text-red-400 hover:text-red-300 text-sm">
                            Delete
                        </button>
                    </div>
                    
                    <div class="flex items-center space-x-2 text-sm text-gray-400">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        <span>124 views</span>
                    </div>
                </div>
            </div>
        `;
    }

    showPostDetail(post) {
        // Similar to news.js implementation
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gray-900 rounded-2xl p-8 w-full max-w-4xl border border-gray-700 max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-copper to-gold text-white mb-4">
                                ${this.capitalizeFirst(post.category)}
                            </span>
                            <h1 class="text-3xl font-bold orbitron copper-gradient mb-2">${this.escapeHtml(post.title)}</h1>
                            <div class="flex items-center space-x-4 text-sm text-gray-400">
                                <span>By ${this.escapeHtml(post.authorName || 'You')}</span>
                                <span>•</span>
                                <span>${this.formatDate(post.createdAt)}</span>
                                <span>•</span>
                                <span class="text-green-400">Published</span>
                            </div>
                        </div>
                        <button class="close-modal text-gray-400 hover:text-white">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="prose prose-invert max-w-none">
                        <p class="text-gray-300 leading-relaxed text-lg">${this.escapeHtml(post.content)}</p>
                    </div>
                    
                    <div class="mt-8 pt-6 border-t border-gray-700">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-4">
                                <button class="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                    </svg>
                                    <span>Like</span>
                                </button>
                                <button class="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                                    </svg>
                                    <span>Comment</span>
                                </button>
                                <button class="flex items-center space-x-2 text-gray-400 hover:text-yellow-400 transition-colors">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"></path>
                                    </svg>
                                    <span>Share</span>
                                </button>
                            </div>
                            
                            <div class="flex items-center space-x-2">
                                <button class="text-blue-400 hover:text-blue-300 text-sm">Edit Post</button>
                                <button class="text-red-400 hover:text-red-300 text-sm">Delete</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Close modal functionality
        modal.querySelector('.close-modal').addEventListener('click', () => {
            document.body.removeChild(modal);
            document.body.style.overflow = 'auto';
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
                document.body.style.overflow = 'auto';
            }
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById(`${tabName}-tab`).classList.remove('hidden');

        this.currentTab = tabName;
    }

    toggleEditMode() {
        if (!this.isEditing) {
            this.switchTab('settings');
            this.isEditing = true;
            document.getElementById('editProfileBtn').textContent = 'Cancel Edit';
        } else {
            this.cancelEdit();
        }
    }

    async handleAvatarUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('Please select a valid image file', 'error');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('Image file must be less than 5MB', 'error');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('profilePicture', file);

            const response = await window.etcHub.uploadProfilePicture(file);
            
            // Update avatar in UI
            const newAvatarUrl = response.user.profilePicture;
            document.getElementById('profileAvatar').src = newAvatarUrl;
            document.getElementById('userAvatar').src = newAvatarUrl;
            
            // Update stored user data
            window.etcHub.user.profilePicture = newAvatarUrl;
            localStorage.setItem('etcHubUser', JSON.stringify(window.etcHub.user));
            
            showNotification('Profile picture updated successfully!', 'success');
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showNotification('Failed to upload profile picture', 'error');
        }
    }

    async saveProfile() {
        const profileData = {
            name: document.getElementById('settingsName').value,
            bio: document.getElementById('settingsBio').value
        };

        try {
            const response = await window.etcHub.updateProfile(profileData);
            
            // Update UI with new data
            this.displayProfile(response.user);
            
            // Update stored user data
            window.etcHub.user = response.user;
            localStorage.setItem('etcHubUser', JSON.stringify(response.user));
            
            this.cancelEdit();
            showNotification('Profile updated successfully!', 'success');
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Failed to update profile', 'error');
        }
    }

    cancelEdit() {
        this.isEditing = false;
        document.getElementById('editProfileBtn').textContent = 'Edit Profile';
        
        // Reset form values
        if (window.etcHub?.user) {
            this.populateSettingsForm(window.etcHub.user);
        }
    }

    updateStats() {
        document.getElementById('postsCount').textContent = this.userPosts.length;
    }

    logout() {
        if (window.etcHub) {
            window.etcHub.logout();
        }
        showNotification('Logged out successfully', 'success');
    }

    // Utility methods
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    createExcerpt(text, maxLength = 200) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});