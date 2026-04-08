import { getMe, type User } from '$lib/auth';

class UserStore {
  currentUser = $state<User | null>(null);
  userLoading = $state(true);
  private isLoaded = false;

  async init() {
    if (this.isLoaded) return;

    try {
      this.currentUser = await getMe();
    } catch (err) {
      this.currentUser = null;
    } finally {
      this.userLoading = false;
      this.isLoaded = true;
    }
  }

  logout() {
    this.currentUser = null;
  }
}

export const userStore = new UserStore();
