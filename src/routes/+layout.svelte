<script lang="ts">
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { refreshToken, logout } from '$lib/auth';
  import { userStore } from '$lib/stores/user.svelte';
  import { sidebarStore } from '$lib/stores/sidebar.svelte';
  import { themeStore } from '$lib/stores/theme.svelte';
  import "$lib/global.css";

  let { children } = $props();

  onMount(async () => {
    // Initialize theme
    themeStore.applyTheme();

    // Try to refresh token if we have one
    await refreshToken();

    // Background sync user data
    await userStore.init();
  });

  const handleLogout = () => {
    logout();
    window.location.href = '/auth/login';
  };

  let currentPath = $derived($page.url.pathname);

  let navItems = $derived([
    { label: 'Home', href: '/', icon: 'home' },
    userStore.currentUser
      ? { label: 'Profile', href: '/me', icon: 'person' }
      : { label: 'Login', href: '/auth/login', icon: 'login' },
    { label: 'Settings', href: '/settings', icon: 'settings' }
  ]);
</script>

<svelte:head>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
</svelte:head>

<div class="app-layout">
  <!-- Header -->
  <div class="appbar">
    <button class="icon-btn left" onclick={() => sidebarStore.toggle()}>
      <span class="material-icons dock-icon">vertical_split</span>
    </button>
    <div class="brand">atomol</div>
    <div class="right-placeholder"></div>
  </div>

  <!-- Overlay -->
  {#if sidebarStore.isOpen}
    <div class="overlay" role="button" tabindex="0" onclick={() => sidebarStore.close()} onkeydown={(e) => e.key === 'Escape' && sidebarStore.close()}></div>
  {/if}

  <!-- Sidebar -->
  <div class="sidebar {sidebarStore.isOpen ? 'open' : ''}">
    <div class="sidebar-header">
      <div class="sidebar-brand">atomol</div>
      <button class="icon-btn" onclick={() => sidebarStore.close()}>
        <span class="material-icons">close</span>
      </button>
    </div>

    <div class="sidebar-nav">
      {#each navItems as item}
        <a
          class="nav-item {currentPath === item.href ? 'active' : ''}"
          href={item.href}
          onclick={() => sidebarStore.close()}
        >
          <span class="material-icons">{item.icon}</span>
          <span>{item.label}</span>
        </a>
      {/each}

      {#if userStore.currentUser}
        <button class="nav-item logout" onclick={handleLogout}>
          <span class="material-icons">logout</span>
          <span>Logout</span>
        </button>
      {/if}
    </div>
  </div>

  <!-- Content -->
  <div class="main-content">
    {@render children()}
  </div>
</div>

<style>
  :global(body) {
    margin: 0;
    font-family: 'DM Sans', sans-serif;
    background: #0f0f0f;
    color: #fff;
  }

  .app-layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .main-content {
    flex: 1;
    padding-bottom: 20px;
  }

  .right-placeholder {
    width: 40px;
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 90;
  }
</style>
