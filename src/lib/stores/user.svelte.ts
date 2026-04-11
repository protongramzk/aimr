import { type User } from '$lib/auth';
import { browser } from '$app/environment';

class UserStore {
  currentUser = $state<User | null>(null);
  userLoading = $state(true);
  private isLoaded = false;

  constructor() {
    if (browser) {
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    if (!browser) return;
    const cached = localStorage.getItem('aipm_user');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        // Ensure the parsed data has a username before setting it
        if (parsed && typeof parsed === 'object') {
          this.currentUser = parsed;
          this.userLoading = false;
        }
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }
  }

  async init() {
    if (!browser) return;
    // If we are already loaded from network, don't re-fetch immediately
    if (this.isLoaded) return;

    const { getMe } = await import('$lib/auth');

    try {
      const user = await getMe();
      if (user) {
        this.currentUser = user;
      }
    } catch (err) {
      console.error('Failed to init user store', err);
    } finally {
      this.userLoading = false;
      this.isLoaded = true;
    }
  }

  logout() {
    this.currentUser = null;
    this.isLoaded = false;
    this.userLoading = false;
  }
}

export const userStore = new UserStore();
