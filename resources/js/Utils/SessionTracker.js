import { router } from '@inertiajs/react';

class SessionTracker {
    constructor() {
        this.updateInterval = null;
        this.lastUpdate = 0;
        this.debounceDelay = 30000; // 30 seconds debounce
        this.activityEvents = [
            'mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'
        ];
        
        // Only initialize if user is authenticated
        if (this.isUserAuthenticated()) {
            this.init();
        }
    }

    isUserAuthenticated() {
        // Check if we're on an authenticated page
        const pathname = window.location.pathname;
        const authenticatedRoutes = ['/dashboard', '/profile', '/new-game', '/history', '/community'];
        return authenticatedRoutes.some(route => pathname.startsWith(route));
    }

    init() {
        // Update activity on user interaction (with debouncing)
        this.activityEvents.forEach(event => {
            document.addEventListener(event, () => this.debouncedUpdateActivity(), { passive: true });
        });

        // Update activity every 10 minutes to keep session alive
        this.updateInterval = setInterval(() => {
            this.updateActivity();
        }, 10 * 60 * 1000); // 10 minutes

        // Initial activity update
        this.updateActivity();
    }

    debouncedUpdateActivity() {
        const now = Date.now();
        if (now - this.lastUpdate > this.debounceDelay) {
            this.updateActivity();
            this.lastUpdate = now;
        }
    }

    async updateActivity() {
        try {
            // Double-check if user is still authenticated
            if (!this.isUserAuthenticated()) {
                this.destroy();
                return;
            }

            // Use GET request to avoid CSRF issues
            const response = await fetch('/update-activity', {
                method: 'GET',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json',
                }
            });

            // Only log errors for non-404 responses
            if (!response.ok && response.status !== 404) {
                console.error('Failed to update activity:', response.status);
            }
        } catch (error) {
            // Silently handle network errors and 404s
            if (!error.message.includes('404')) {
                console.error('Network error updating activity:', error);
            }
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.activityEvents.forEach(event => {
            document.removeEventListener(event, this.updateActivity);
        });
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sessionTracker = new SessionTracker();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (window.sessionTracker) {
        window.sessionTracker.destroy();
    }
});
