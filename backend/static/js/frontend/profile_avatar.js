class AuthManager {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = JSON.parse(localStorage.getItem('user') || 'null');
    }
    init() {
        this.checkLoginStatus();
        this.setupInterceptors();
    }
    checkLoginStatus() {
        if (this.isTokenValid()) {
            this.updateUIForLoggedInUser();
        } else {
            this.clearExpiredToken();
            this.updateUIForLoggedOutUser();
        }
    }
    isTokenValid() {
        if (!this.token) return false;

        try {
            if (this.token.split('.').length === 3) {
                const payload = JSON.parse(atob(this.token.split('.')[1]));
                if (payload.exp && Date.now() >= payload.exp * 1000) {
                    return false;
                }
            }
            return true;
        } catch (error) {
            return false;
        }
    }
    clearExpiredToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.token = null;
        this.user = null;
    }

    updateUIForLoggedInUser() {
        const avatar = document.getElementById('avatar');
        const dropdown = document.getElementById('dropdown');

        if (!avatar || !dropdown) return;

        const initials = this.getUserInitials(this.user.name || this.user.email);
        avatar.innerHTML = initials;
        avatar.style.background = '#e67e22';

        dropdown.innerHTML = `
            <div class="dropdown-menu">
                <div class="dropdown-header">
                    <strong>${this.user.name || this.user.email.split('@')[0]}</strong>
                    <p>${this.user.email}</p>
                </div>
                <a href="/orders" class="dropdown-item">
                    <i class="fas fa-clipboard-list" style="margin-right: 8px;"></i>
                    My Orders
                </a>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item logout" onclick="authManager.logout()">
                    <i class="fas fa-sign-out-alt" style="margin-right: 8px;"></i>
                    Logout
                </div>
            </div>
        `;

        this.setupDropdownListeners();
    }

    updateUIForLoggedOutUser() {
        const avatar = document.getElementById('avatar');
        const dropdown = document.getElementById('dropdown');

        if (!avatar || !dropdown) return;

        avatar.innerHTML = '<i class="fas fa-user"></i>';
        avatar.style.background = '#95a5a6';

        const currentUrl = encodeURIComponent(window.location.href);
        dropdown.innerHTML = `
            <div class="dropdown-menu">
                <a href="/admin/login?redirect=${currentUrl}" class="dropdown-item">
                    <i class="fas fa-sign-in-alt" style="margin-right: 8px;"></i>
                    Login
                </a>
                <a href="/register?redirect=${currentUrl}" class="dropdown-item">
                    <i class="fas fa-user-plus" style="margin-right: 8px;"></i>
                    Register
                </a>
            </div>
        `;

        this.setupDropdownListeners();
    }

    getUserInitials(name) {
        if (!name) return '?';
        return name.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    }

    getAuthHeaders() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }

    handleUnauthorized() {
        this.clearExpiredToken();
        this.updateUIForLoggedOutUser();
        if (this.isProtectedPage()) {
            window.location.href = `/admin/login?redirect=${encodeURIComponent(window.location.href)}`;
        }
    }

    isProtectedPage() {
        const protectedPaths = ['/orders', '/profile', '/account'];
        return protectedPaths.some(path => window.location.pathname.startsWith(path));
    }

    setupInterceptors() {
        const originalFetch = window.fetch;

        window.fetch = async (...args) => {
            let [resource, config] = args;
            if (this.token && config) {
                config.headers = {
                    ...config.headers,
                    'Authorization': `Bearer ${this.token}`
                };
            }

            const response = await originalFetch(resource, config);

            if (response.status === 401) {
                this.handleUnauthorized();
                return Promise.reject(new Error('Unauthorized'));
            }

            return response;
        };
    }

    setupDropdownListeners() {
        const dropdown = document.getElementById('dropdown');
        if (!dropdown) return;

        dropdown.addEventListener('click', (event) => {
            if (event.target.classList.contains('dropdown-item')) {
                dropdown.classList.remove('show');
            }
        });
    }

    initProfileDropdown() {
        const avatar = document.getElementById('avatar');
        const dropdown = document.getElementById('dropdown');

        if (!avatar || !dropdown) return;

        avatar.addEventListener('click', (event) => {
            event.stopPropagation();
            dropdown.classList.toggle('show');
        });

        document.addEventListener('click', (event) => {
            if (!avatar.contains(event.target) && !dropdown.contains(event.target)) {
                dropdown.classList.remove('show');
            }
        });
    }

    logout() {
        if (this.token) {
            fetch('/api/auth/logout', {
                method: 'POST',
                headers: this.getAuthHeaders()
            }).catch(() => {
            });
        }

        this.clearExpiredToken();
        this.updateUIForLoggedOutUser();

        const dropdown = document.getElementById('dropdown');
        if (dropdown) dropdown.classList.remove('show');
        if (this.isProtectedPage()) {
            window.location.href = '/';
        }
    }
}

// Initialize AuthManager
const authManager = new AuthManager();

document.addEventListener('DOMContentLoaded', function() {
    authManager.initProfileDropdown();
    authManager.init();
});

// Make available globally
window.authManager = authManager;
window.logoutUser = () => authManager.logout();