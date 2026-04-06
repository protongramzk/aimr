<script>
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import {refreshToken, getMe, logout } from '$lib/auth';
  import "$lib/global.css";
  
  // Store global user biar semua component bisa subscribe
  export const currentUser = writable(null)

  let tokenRefreshed = false

  onMount(async () => {
    if (!tokenRefreshed) {
      tokenRefreshed = true

      // coba refresh token
      const refreshed = await refreshToken()
      if (refreshed) {
        // kalau sukses, ambil data user
        const me = await getMe()
        currentUser.set(me)
      } else {
        console.warn('Token refresh gagal, logout mungkin perlu')
      }
    }
  })
  const sidebarOpen = writable(false);

  const toggleSidebar = () => sidebarOpen.update(v => !v);
  const closeSidebar = () => sidebarOpen.set(false);

  let currentPath = '';
  let user = null;

  onMount(async () => {
    currentPath = $page.url.pathname;
    user = await getMe();
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  $: navItems = [
    { label: 'Home', href: '/', icon: 'home' },
    user
      ? { label: 'Profile', href: '/me', icon: 'person' }
      : { label: 'Login', href: '/auth/login', icon: 'login' },
    { label: 'Settings', href: '/settings', icon: 'settings' }
  ];
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

<div class="app-layout">
  <!-- 🔝 Header -->
<div class="appbar">
  <button class="icon-btn left" on:click={toggleSidebar}>
    <span class="material-icons dock-icon">vertical_split</span>
  </button>

  <div class="brand">AIPM</div>

  <button class="icon-btn right">
    <span class="material-icons">account_circle</span>
  </button>
</div>
  <!-- 🌫 Overlay -->
  {#if $sidebarOpen}
    <div class="overlay" on:click={closeSidebar}></div>
  {/if}

  <!-- 📚 Sidebar -->
  <div class="sidebar {$sidebarOpen ? 'open' : ''}">
    {#each navItems as item}
      <a
        class="nav-item {currentPath === item.href ? 'active' : ''}"
        href={item.href}
        on:click={closeSidebar}
      >
        <span class="material-icons">{item.icon}</span>
        <span>{item.label}</span>
      </a>
    {/each}

    <button class="nav-item logout" on:click={handleLogout}>
      <span class="material-icons">logout</span>
      <span>Logout</span>
    </button>
  </div>

  <!-- 🧩 Content -->
  <div class="main-content">
    <slot />
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'DM Sans', sans-serif;
    background: #0f0f0f;
    color: #fff;
  }
</style>
