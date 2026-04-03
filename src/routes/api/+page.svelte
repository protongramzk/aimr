<script>
  import { onMount } from 'svelte';
  import { writable } from 'svelte/store';
  import { copyToClipboard } from '$lib/utils.js'; // helper copy
  import Servex from '$lib/auth.js'; // Servex client

  let loading = false;
  let creating = false;
  let error = '';
  let keys = writable([]);

  async function loadKeys() {
    loading = true;
    try {
      const apiKeys = await Servex.listApiKeys();
      keys.set(apiKeys);
    } catch(err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }

  async function createKey() {
    creating = true;
    try {
      const name = prompt('Enter key name', 'default') || 'default';
      const rawKey = await Servex.createApiKey(name); // langsung return key
      alert(`Copy & store this key securely:\n${rawKey}`);
      await loadKeys(); // reload dari server
    } catch(err) {
      alert(err.message);
    } finally {
      creating = false;
    }
  }

  async function deleteKey(keyId) {
    if(!confirm('Delete this API key?')) return;
    try {
      await Servex.deleteApiKey(keyId);
      await loadKeys(); // reload dari server
    } catch(err) {
      alert(err.message);
    }
  }

  onMount(loadKeys);
</script>

<div class="api-page">
  <h1>API Keys</h1>

  <button class="btn btn-primary" on:click={createKey} disabled={creating}>
    {creating ? 'Creating...' : 'Create Key'}
  </button>

  {#if loading}
    <p>Loading keys...</p>
  {/if}

  <div class="keys-list">
    {#each $keys as key}
      <div class="card key-card">
        <div class="key-info">
          <div class="key-name">{key.name}</div>
          <div class="key-value">{key.key}</div>
        </div>
        <div class="actions">
          <button class="btn btn-outline" on:click={() => copyToClipboard(key.key)}>Copy</button>
          <button class="btn btn-critical" on:click={() => deleteKey(key.id)}>Delete</button>
        </div>
      </div>
    {/each}
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}
</div>

<style>
  @import '$lib/global.css';

  .api-page {
    padding: 20px;
  }

  h1 {
    font-family: var(--font-display);
    text-transform: uppercase;
    margin-bottom: 16px;
  }

  .keys-list {
    margin-top: 16px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .key-card {
    background: var(--color-surface);
    border: 2px solid var(--color-primary);
    border-radius: 8px;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.1s;
    cursor: pointer;
  }

  .key-card:active {
    transform: scale(0.97);
  }

  .key-name {
    font-family: var(--font-mono);
    font-weight: bold;
    margin-bottom: 4px;
  }

  .key-value {
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-text-dim);
    word-break: break-all;
  }

  .actions {
    display: flex;
    gap: 8px;
  }

  .btn {
    font-family: var(--font-display);
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 8px 12px;
    border-radius: 4px;
    cursor: pointer;
    border: 2px solid transparent;
  }

  .btn-primary {
    background-color: var(--color-primary);
    color: var(--color-base);
  }

  .btn-critical {
    background-color: var(--color-secondary);
    color: var(--color-base);
  }

  .btn-outline {
    background: transparent;
    border: 2px solid var(--color-primary);
    color: var(--color-primary);
  }

  .error {
    color: red;
    margin-top: 12px;
  }
</style>
