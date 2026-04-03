<script>
  import { writable } from 'svelte/store';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { getMe, logout } from '$lib/auth';
  import "$lib/global.css";

  const sidebarOpen = writable(false);

  function toggleSidebar() {
    sidebarOpen.update(v => !v);
  }

  function closeSidebar() {
    sidebarOpen.set(false);
  }

  let currentPath = '';
  let user = null;

  onMount(async () => {
    currentPath = $page.url.pathname;
    user = await getMe();
  });

  function handleLogout() {
    logout();
    window.location.href = '/auth/login';
  }

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
    <button class="icon-btn" on:click={toggleSidebar}>
      <span class="material-icons">menu</span>
    </button>

    <div class="brand">AIPM</div>

    <button class="icon-btn">
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
        on:click={closeSidebar}>
        <span class="material-icons">{item.icon}</span>
        <span>{item.label}</span>
      </a>
    {/each}

    {#if true}
      <button class="nav-item logout" on:click={handleLogout}>
        <span class="material-icons">logout</span>
        <span>Logout</span>
      </button>
    {/if}
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

  /* Header */
  .appbar {
    position: sticky;
    top: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 18px;
    background: #121212;
    border-bottom: 1px solid #2a2a2a;
  }

  .brand {
    font-weight: 700;
    font-size: 18px;
    letter-spacing: 1px;
  }

  .icon-btn {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
  }

  /* Overlay */
  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 90;
  }

  /* Sidebar */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 220px;
    height: 100%;
    background: #121212;
    border-right: 1px solid #2a2a2a;
    padding: 20px 0;
    transform: translateX(-100%);
    transition: 0.25s ease;
    z-index: 100;
    display: flex;
    flex-direction: column;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 18px;
    color: #aaa;
    text-decoration: none;
    border-left: 3px solid transparent;
    cursor: pointer;
    font-size: 14px;
    transition: 0.2s;
  }

  .nav-item:hover {
    background: #1f1f1f;
    color: #fff;
  }

  .nav-item.active {
    background: #2a2a2a;
    color: #fff;
    border-left: 3px solid #8b5cf6;
  }

  .nav-item .material-icons {
    font-size: 20px;
  }

  /* Logout special */
  .logout {
    margin-top: auto;
    border-top: 1px solid #2a2a2a;
  }

  .logout:hover {
    background: #ff4d4f;
    color: white;
  }

  /* Content */
  .main-content {
    padding: 70px 16px 16px;
  }
</style>
