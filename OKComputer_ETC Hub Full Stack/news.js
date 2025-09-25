// News Page JavaScript
class NewsManager {
    constructor() {
        this.currentFilter = 'all';
        this.searchQuery = '';
        this.posts = [];
        this.filteredPosts = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPosts();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Search functionality
        document.getElementById('searchInput')?.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.toLowerCase();
            this.filterPosts();
        });

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.category;
                this.filterPosts();
            });
        });

        // Create post modal
        document.getElementById('createPostBtn')?.addEventListener('click', () => this.showCreatePostModal());
        document.getElementById('createFirstPost')?.addEventListener('click', () => this.showCreatePostModal());
        document.getElementById('closePostModal')?.addEventListener('click', () => this.hideCreatePostModal());
        document.getElementById('cancelPost')?.addEventListener('click', () => this.hideCreatePostModal());

        // Create post form
        document.getElementById('createPostForm')?.addEventListener('submit', (e) => this.handleCreatePost(e));

        // Modal backdrop click
        document.getElementById('createPostModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'createPostModal') {
                this.hideCreatePostModal();
            }
        });

        // Auth button
        document.getElementById('authBtn')?.addEventListener('click', () => {
            if (window.etcHub?.user) {
                window.location.href = 'profile.html';
            } else {
                window.location.href = 'index.html#auth';
            }
        });
    }

    async checkAuthStatus() {
        if (window.etcHub?.user) {
            document.getElementById('userMenu').classList.remove('hidden');
            document.getElementById('userName').textContent = window.etcHub.user.name || window.etcHub.user.username;
            if (window.etcHub.user.profilePicture) {
                document.getElementById('userAvatar').src = window.etcHub.user.profilePicture;
            }
            document.getElementById('authBtn').style.display = 'none';
        } else {
            document.getElementById('userMenu').classList.add('hidden');
            document.getElementById('authBtn').style.display = 'block';
        }
    }

    async loadPosts() {
        try {
            this.showLoadingState();
            
            if (window.etcHub) {
                const data = await window.etcHub.getPosts();
                this.posts = data || [];
            } else {
                // Mock data for demonstration
                this.posts = this.generateMockPosts();
            }
            
            this.filterPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showErrorState();
        }
    }

    generateMockPosts() {
        return [
            {
                id: '1',
                title: 'Ethereum Classic Network Upgrade Successfully Deployed',
                content: 'The Ethereum Classic network has successfully implemented the latest upgrade, improving transaction throughput and reducing gas fees. This upgrade marks a significant milestone in the ongoing development of the ETC ecosystem, bringing enhanced performance and security to all network participants.',
                category: 'news',
                authorName: 'CryptoAnalyst',
                authorId: 'user1',
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                status: 'published'
            },
            {
                id: '2',
                title: 'Complete Guide to ETC Mining in 2024',
                content: 'Learn everything you need to know about mining Ethereum Classic in 2024. This comprehensive guide covers hardware requirements, software setup, pool selection, and profitability calculations. Discover the most efficient mining strategies and optimize your ETC mining operations.',
                category: 'mining',
                authorName: 'MiningExpert',
                authorId: 'user2',
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                status: 'published'
            },
            {
                id: '3',
                title: 'ETC vs ETH: Key Differences and Investment Outlook',
                content: 'A detailed analysis comparing Ethereum Classic and Ethereum, examining their technical differences, philosophical approaches, and investment potential. This analysis explores the fundamental distinctions between the two networks and their respective positions in the cryptocurrency market.',
                category: 'analysis',
                authorName: 'BlockchainResearcher',
                authorId: 'user3',
                createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
                status: 'published'
            },
            {
                id: '4',
                title: 'Setting Up Your First ETC Wallet: Step-by-Step Tutorial',
                content: 'A beginner-friendly tutorial on setting up your first Ethereum Classic wallet. This guide covers different wallet types, security best practices, and how to safely store and manage your ETC tokens. Perfect for newcomers to the ETC ecosystem.',
                category: 'tutorial',
                authorName: 'CryptoEducator',
                authorId: 'user4',
                createdAt: new Date(Date.now() - 345600000).toISOString(), // 4 days ago
                status: 'published'
            },
            {
                id: '5',
                title: 'ETC Price Analysis: Market Trends and Future Projections',
                content: 'An in-depth analysis of Ethereum Classic price movements, market trends, and potential future scenarios. This report examines technical indicators, market sentiment, and fundamental factors that could influence ETC price in the coming months.',
                category: 'analysis',
                authorName: 'MarketAnalyst',
                authorId: 'user5',
                createdAt: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
                status: 'published'
            },
            {
                id: '6',
                title: 'ETC Community Governance: Recent Developments',
                content: 'Updates on the latest developments in Ethereum Classic community governance. This article covers recent proposals, voting outcomes, and the ongoing efforts to improve decentralized decision-making within the ETC ecosystem.',
                category: 'news',
                authorName: 'CommunityVoice',
                authorId: 'user6',
                createdAt: new Date(Date.now() - 518400000).toISOString(), // 6 days ago
                status: 'published'
            }
        ];
    }

    filterPosts() {
        this.filteredPosts = this.posts.filter(post => {
            const matchesCategory = this.currentFilter === 'all' || post.category === this.currentFilter;
            const matchesSearch = this.searchQuery === '' || 
                post.title.toLowerCase().includes(this.searchQuery) ||
                post.content.toLowerCase().includes(this.searchQuery) ||
                post.authorName.toLowerCase().includes(this.searchQuery);
            
            return matchesCategory && matchesSearch;
        });

        this.renderPosts();
    }

    renderPosts() {
        const postsGrid = document.getElementById('postsGrid');
        const emptyState = document.getElementById('emptyState');
        const loadingState = document.getElementById('loadingState');

        // Hide loading state
        loadingState.classList.add('hidden');

        if (this.filteredPosts.length === 0) {
            postsGrid.classList.add('hidden');
            emptyState.classList.remove('hidden');
            return;
        }

        emptyState.classList.add('hidden');
        postsGrid.classList.remove('hidden');

        postsGrid.innerHTML = this.filteredPosts.map(post => this.createPostCard(post)).join('');

        // Add click listeners to post cards
        postsGrid.querySelectorAll('.post-card').forEach((card, index) => {
            card.addEventListener('click', () => this.showPostDetail(this.filteredPosts[index]));
        });

        // Animate posts
        anime({
            targets: '.post-card',
            opacity: [0, 1],
            translateY: [30, 0],
            delay: anime.stagger(100),
            duration: 600,
            easing: 'easeOutExpo'
        });
    }

    createPostCard(post) {
        const formattedDate = this.formatDate(post.createdAt);
        const excerpt = this.createExcerpt(post.content, 150);

        return `
            <div class="post-card p-6 rounded-2xl cursor-pointer">
                <div class="flex items-center justify-between mb-4">
                    <span class="category-badge">${this.capitalizeFirst(post.category)}</span>
                    <span class="text-sm text-gray-400">${formattedDate}</span>
                </div>
                
                <h3 class="text-xl font-semibold mb-3 text-white hover:text-yellow-400 transition-colors">
                    ${this.escapeHtml(post.title)}
                </h3>
                
                <p class="text-gray-400 mb-4 leading-relaxed">
                    ${this.escapeHtml(excerpt)}
                </p>
                
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-gradient-to-r from-copper to-gold rounded-full flex items-center justify-center">
                            <span class="text-white text-sm font-semibold">
                                ${post.authorName ? post.authorName.charAt(0).toUpperCase() : 'U'}
                            </span>
                        </div>
                        <span class="text-sm text-gray-300">${this.escapeHtml(post.authorName || 'Unknown Author')}</span>
                    </div>
                    
                    <button class="text-yellow-400 hover:text-yellow-300 font-medium text-sm">
                        Read More →
                    </button>
                </div>
            </div>
        `;
    }

    showPostDetail(post) {
        // Create and show post detail modal
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50';
        modal.innerHTML = `
            <div class="flex items-center justify-center min-h-screen p-4">
                <div class="bg-gray-900 rounded-2xl p-8 w-full max-w-4xl border border-gray-700 max-h-screen overflow-y-auto">
                    <div class="flex justify-between items-start mb-6">
                        <div>
                            <span class="category-badge">${this.capitalizeFirst(post.category)}</span>
                            <h1 class="text-3xl font-bold orbitron copper-gradient mt-4 mb-2">${this.escapeHtml(post.title)}</h1>
                            <div class="flex items-center space-x-4 text-sm text-gray-400">
                                <span>By ${this.escapeHtml(post.authorName || 'Unknown Author')}</span>
                                <span>•</span>
                                <span>${this.formatDate(post.createdAt)}</span>
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

    showCreatePostModal() {
        if (!window.etcHub?.user) {
            showNotification('Please sign in to create posts', 'error');
            return;
        }

        document.getElementById('createPostModal').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    hideCreatePostModal() {
        document.getElementById('createPostModal').classList.add('hidden');
        document.body.style.overflow = 'auto';
        document.getElementById('createPostForm').reset();
    }

    async handleCreatePost(e) {
        e.preventDefault();
        
        if (!window.etcHub?.user) {
            showNotification('Please sign in to create posts', 'error');
            return;
        }

        const formData = new FormData(e.target);
        const postData = {
            title: document.getElementById('postTitle').value,
            content: document.getElementById('postContent').value,
            category: document.getElementById('postCategory').value
        };

        try {
            const response = await window.etcHub.createPost(postData);
            showNotification('Post submitted for moderation!', 'success');
            this.hideCreatePostModal();
            
            // Add the new post to the pending list (it will be available after moderation)
            this.posts.unshift(response.post);
            this.filterPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            showNotification('Failed to create post. Please try again.', 'error');
        }
    }

    showLoadingState() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('postsGrid').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');
    }

    showErrorState() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('postsGrid').classList.add('hidden');
        document.getElementById('emptyState').classList.remove('hidden');
        
        document.getElementById('emptyState').innerHTML = `
            <div class="max-w-md mx-auto">
                <svg class="w-16 h-16 mx-auto text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                </svg>
                <h3 class="text-xl font-semibold text-red-400 mb-2">Failed to load posts</h3>
                <p class="text-gray-400 mb-6">Please refresh the page or try again later</p>
                <button onclick="location.reload()" class="btn-primary px-6 py-3 rounded-lg font-semibold">Retry</button>
            </div>
        `;
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

    createExcerpt(text, maxLength = 150) {
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

// Initialize news manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsManager = new NewsManager();
});