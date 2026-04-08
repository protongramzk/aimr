<script lang="ts">
  import { themeStore, themes, type ThemeName } from '$lib/stores/theme.svelte';

  const themeList: ThemeName[] = ['Default', 'Tenper', 'Orangrape'];

  function selectTheme(name: ThemeName) {
    themeStore.setTheme(name);
  }
</script>

<div class="container">
  <div class="header">
    <h1 class="title">Settings</h1>
    <p class="subtitle">Customize your experience</p>
  </div>

  <div class="section">
    <h2 class="section-title">Theme</h2>
    <div class="theme-grid">
      {#each themeList as name}
        <button
          class="theme-card {themeStore.currentTheme === name ? 'active' : ''}"
          onclick={() => selectTheme(name)}
        >
          <div class="theme-preview">
            <div class="color-swatch" style="background-color: {themes[name].primary}"></div>
            <div class="color-swatch" style="background-color: {themes[name].accent}"></div>
          </div>
          <div class="theme-info">
            <span class="theme-name">{name}</span>
            {#if themeStore.currentTheme === name}
              <span class="material-icons check">check_circle</span>
            {/if}
          </div>
        </button>
      {/each}
    </div>
  </div>
</div>

<style>
  .header {
    margin-bottom: 32px;
  }

  .title {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 4px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .subtitle {
    color: var(--color-text-dim);
    font-size: 14px;
    margin: 0;
  }

  .section {
    margin-bottom: 40px;
  }

  .section-title {
    font-size: 12px;
    font-family: var(--font-mono);
    text-transform: uppercase;
    letter-spacing: 2px;
    color: var(--color-primary);
    margin-bottom: 16px;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 8px;
  }

  .theme-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .theme-card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 12px;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .theme-card:hover {
    border-color: var(--color-text-muted);
    background: var(--color-surface-2);
  }

  .theme-card.active {
    border-color: var(--color-primary);
    background: var(--color-surface-2);
  }

  .theme-preview {
    display: flex;
    gap: 4px;
    height: 40px;
  }

  .color-swatch {
    flex: 1;
    border-radius: 2px;
  }

  .theme-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .theme-name {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-main);
  }

  .check {
    font-size: 18px;
    color: var(--color-primary);
  }
</style>
