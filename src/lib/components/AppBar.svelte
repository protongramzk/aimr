<script lang="ts">
  import { sidebarStore } from '$lib/stores/sidebar.svelte';

  function toggleSidebar() {
    sidebarStore.toggle();
  }
</script>

<div class="appbar">
  <button class="icon-btn" onclick={toggleSidebar}>
    <span class="material-icons">menu</span>
  </button>

  <div class="brand">AIMR.</div>

  <button class="icon-btn">
    <span class="material-icons">settings</span>
  </button>
</div>

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
    letter-spacing: 2px;
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
    padding: 8px;
  }

  .icon-btn:hover {
    color: var(--color-primary);
  }
</style>
