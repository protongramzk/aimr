<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getApiKeys, createApiKey, deleteApiKey, renameApiKey, logout } from '$lib/auth';
  import { userStore } from '$lib/stores/user.svelte';

  let keys = $state<any[]>([]);
  let keysLoading = $state(false);
  let newKeyName = $state('');
  let revealedKey = $state('');
  let creating = $state(false);

  let deletingId = $state<string | null>(null);
  let renamingId = $state<string | null>(null);
  let renameValue = $state('');

  async function fetchKeys() {
    if (!userStore.currentUser) return;
    keysLoading = true;
    try {
      const res = await getApiKeys();
      keys = res.keys || [];
    } catch (err) {
      console.error('Failed to fetch keys', err);
    } finally {
      keysLoading = false;
    }
  }

  async function handleCreate() {
    if (!newKeyName.trim()) return;
    creating = true;
    try {
      const res = await createApiKey(newKeyName);
      revealedKey = res.key;
      newKeyName = '';
      await fetchKeys();
    } catch (err) {
      alert('Failed to create key');
    } finally {
      creating = false;
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteApiKey(id);
      keys = keys.filter(k => k.id !== id);
      deletingId = null;
    } catch (err) {
      alert('Failed to delete key');
    }
  }

  async function handleRename(id: string) {
    if (!renameValue.trim()) return;
    try {
      await renameApiKey(id, renameValue);
      const key = keys.find(k => k.id === id);
      if (key) key.name = renameValue;
      renamingId = null;
    } catch (err) {
      alert('Failed to rename key');
    }
  }

  function startRename(key: any) {
    renamingId = key.id;
    renameValue = key.name;
  }

  function handleLogout() {
    logout();
    goto('/auth/login');
  }

  function fmtDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString();
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      alert('Failed to copy');
    }
  }

  $effect(() => {
    if (!userStore.userLoading && !userStore.currentUser) {
      goto('/auth/login');
    }
  });

  onMount(async () => {
    // We can fetch keys immediately if we have a user
    if (userStore.currentUser) {
      fetchKeys();
    } else {
      // If no user, wait for init to see if session is valid
      await userStore.init();
      if (userStore.currentUser) {
        fetchKeys();
      }
    }
  });
</script>

{#if userStore.currentUser}
<div class="container me-page">

  <div class="card me-profile-card">
    <div class="me-avatar-row">
      <div class="avatar me-avatar">
        {userStore.currentUser.username[0].toUpperCase()}
      </div>
      <div class="me-avatar-meta">
        <span class="me-username">{userStore.currentUser.username}</span>
        <span class="me-email">{userStore.currentUser.email || 'No email provided'}</span>
      </div>
    </div>

    <div class="me-profile-actions">
      <button class="icon-btn logout-btn" onclick={handleLogout}>
        <span class="material-icons">logout</span>
        <span>Logout</span>
      </button>
    </div>
  </div>

  <div class="me-section-label">
    <span class="material-icons" style="font-size:14px">vpn_key</span>
    API KEYS
  </div>

  {#if revealedKey}
    <div class="card me-key-reveal">
      <div class="me-key-reveal-head">
        <span class="material-icons" style="color:var(--color-primary)">info</span>
        Copy your key now. You won't see it again!
      </div>
      <div class="me-key-raw">
        <code>{revealedKey}</code>
        <button class="icon-btn" onclick={() => copyToClipboard(revealedKey)}>
          <span class="material-icons" style="font-size:18px">content_copy</span>
        </button>
      </div>
      <button class="btn-text" onclick={() => revealedKey = ''} style="margin-top:12px">Dismiss</button>
    </div>
  {/if}

  <div class="card">
    <div class="boxy-input-group" style="border:none; padding:0">
      <label class="boxy-label" for="key-name">New API Key Name</label>
      <div class="me-create-row">
        <input
          id="key-name"
          class="boxy-text-input"
          type="text"
          placeholder="e.g., local-dev"
          bind:value={newKeyName}
          onkeydown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          class="btn-primary me-create-btn"
          onclick={handleCreate}
          disabled={creating || !newKeyName.trim()}
        >
          {#if creating}
            <span class="material-icons spin">sync</span>
          {:else}
            <span class="material-icons">add</span>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <div class="card" style="padding:0; overflow:hidden;">
    {#if keysLoading}
      <div class="loading-state">
        <span class="material-icons spin">sync</span>
      </div>
    {:else if keys.length === 0}
      <div class="empty-state">
        <span class="material-icons">key_off</span>
        <p>No API keys found.</p>
      </div>
    {:else}
      <ul class="key-list">
        {#each keys as key (key.id)}
          <li class="key-item">
            <div class="key-info">
              {#if renamingId === key.id}
                <div class="rename-row">
                  <input
                    class="boxy-text-input rename-input"
                    bind:value={renameValue}
                    onkeydown={(e) => e.key === 'Enter' && handleRename(key.id)}
                    placeholder="New name"
                  />
                  <button class="icon-btn" onclick={() => handleRename(key.id)}>
                    <span class="material-icons" style="color:var(--color-primary)">check</span>
                  </button>
                  <button class="icon-btn" onclick={() => renamingId = null}>
                    <span class="material-icons">close</span>
                  </button>
                </div>
              {:else}
                <span class="key-name">{key.name}</span>
                <span class="key-date">Created on {fmtDate(key.created_at)}</span>
              {/if}
            </div>

            <div class="key-actions">
              {#if deletingId === key.id}
                <span class="confirm-text">Delete?</span>
                <button class="icon-btn" onclick={() => handleDelete(key.id)}>
                  <span class="material-icons" style="color:var(--color-error)">delete_forever</span>
                </button>
                <button class="icon-btn" onclick={() => deletingId = null}>
                  <span class="material-icons">close</span>
                </button>
              {:else}
                <button class="icon-btn" onclick={() => startRename(key)}>
                  <span class="material-icons">edit</span>
                </button>
                <button class="icon-btn" onclick={() => deletingId = key.id}>
                  <span class="material-icons">delete</span>
                </button>
              {/if}
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>

</div>
{:else if userStore.userLoading}
  <div class="loading-state">
     <span class="material-icons spin">sync</span>
     <p>Loading profile...</p>
  </div>
{/if}

<style>
  .me-page {
    max-width: 600px;
    margin: 0 auto;
    padding-top: 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 20px;
  }

  .me-profile-card {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .me-avatar-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .me-avatar {
    width: 56px;
    height: 56px;
    background: var(--color-surface-2);
    color: var(--color-primary);
    border: 1px solid var(--color-border);
    border-radius: 8px;
    font-size: 24px;
    font-weight: 800;
  }

  .me-avatar-meta {
    display: flex;
    flex-direction: column;
  }

  .me-username {
    font-size: 18px;
    font-weight: 800;
    color: var(--color-text-main);
  }

  .me-email {
    font-size: 13px;
    color: var(--color-text-dim);
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--color-text-dim);
    font-size: 13px;
    font-weight: 600;
  }

  .logout-btn:hover {
    color: var(--color-error);
  }

  .me-section-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    font-weight: 800;
    color: var(--color-text-dim);
    letter-spacing: 2px;
    margin-top: 8px;
  }

  .me-key-reveal {
    background: rgba(var(--color-primary-rgb), 0.1);
    border-color: var(--color-primary);
  }

  .me-key-reveal-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--color-text-main);
    margin-bottom: 12px;
  }

  .me-key-raw {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--color-base);
    border: 1px solid var(--color-border);
    padding: 12px;
    border-radius: 4px;
  }

  .me-key-raw code {
    flex: 1;
    font-family: var(--font-mono);
    font-size: 13px;
    color: var(--color-primary);
    word-break: break-all;
  }

  .me-create-row {
    display: flex;
    gap: 12px;
    margin-top: 8px;
  }

  .btn-primary {
    background: var(--color-primary);
    color: var(--color-primary-inv);
    border: none;
    padding: 8px 16px;
    font-weight: 800;
    cursor: pointer;
  }

  .key-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .key-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid var(--color-border);
  }

  .key-item:last-child {
    border-bottom: none;
  }

  .key-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex: 1;
  }

  .key-name {
    font-family: var(--font-mono);
    font-size: 14px;
    font-weight: 600;
  }

  .key-date {
    font-size: 11px;
    color: var(--color-text-dim);
  }

  .key-actions {
    display: flex;
    gap: 8px;
    align-items: center;
  }

  .rename-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .rename-input {
    border-bottom: 1px solid var(--color-primary);
    padding: 4px 0;
  }

  .confirm-text {
    font-size: 12px;
    color: var(--color-error);
    font-weight: 600;
  }

  .loading-state, .empty-state {
    padding: 40px;
    text-align: center;
    color: var(--color-text-dim);
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .btn-text {
    background: transparent;
    border: none;
    color: var(--color-text-dim);
    cursor: pointer;
    font-size: 12px;
    font-weight: 600;
    padding: 0;
  }

  .btn-text:hover {
    color: var(--color-text-main);
  }
</style>
