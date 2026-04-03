import { writable } from 'svelte/store';
import Servex from '$lib/auth.js';

export const currentUser = writable(null);
export const userLoading = writable(true);

let isLoaded = false;

export async function initUser() {
  // Kalau sudah ada datanya, gak usah ambil lagi (Caching)
  if (isLoaded) return;

  try {
    const user = await Servex.getMe();
    currentUser.set(user);
  } catch (err) {
    currentUser.set(null);
  } finally {
    userLoading.set(false);
    isLoaded = true;
  }
}
