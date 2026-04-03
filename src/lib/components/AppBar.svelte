<script>
  import { writable } from 'svelte/store';

  // Sidebar state global
  export const sidebarOpen = writable(false);

  function toggleSidebar() {
    sidebarOpen.update(v => !v);
  }
</script>

<style>
  .appbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 24px;
    background-color: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .brand {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 20px;
    color: var(--color-text-main);
    text-align: center;
    flex: 1;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: var(--color-text-main);
    cursor: pointer;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  /* Sidebar Styles */
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    width: 240px;
    height: 100%;
    background-color: var(--color-surface);
    border-right: 1px solid var(--color-border);
    padding: 20px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
    z-index: 90;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .sidebar .nav-item {
    font-family: var(--font-display);
    text-transform: uppercase;
    color: var(--color-text-main);
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.2s;
  }

  .sidebar .nav-item:hover {
    background-color: var(--color-primary);
    color: var(--color-base);
  }
</style>

<div class="appbar">
  <!-- Tombol Sidebar -->
  <button class="icon-btn" on:click={toggleSidebar}>
    <span class="material-icons">menu</span>
  </button>

  <!-- Brand Tengah -->
  <div class="brand">AIMR.</div>

  <!-- Dock / Right Icon (misal settings) -->
  <button class="icon-btn">
    <span class="material-icons">settings</span>
  </button>
</div>

<!-- Sidebar -->
{#if $sidebarOpen}
  <div class="sidebar open">
    <div class="nav-item">Home</div>
    <div class="nav-item">Packages</div>
    <div class="nav-item">Profile</div>
    <div class="nav-item">Settings</div>
    <div class="nav-item">Logout</div>
  </div>
{/if}
