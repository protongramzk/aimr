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
    const cached = localStorage.getItem('aipm_user');
    if (cached) {
      try {
        this.currentUser = JSON.parse(cached);
        this.userLoading = false;
      } catch (e) {
        console.error('Failed to parse cached user', e);
      }
    }
  }

  async init() {
    // If we are already loaded from network, don't re-fetch immediately
    // unless we want to force a refresh.
    if (this.isLoaded) return;

    // Importing getMe here to avoid circular dependency if possible,
    // though auth.ts currently doesn't import userStore.
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
  }
}

export const userStore = new UserStore();
