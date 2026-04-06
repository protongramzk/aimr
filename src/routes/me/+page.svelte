<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import {
    getMe,
    isLoggedIn,
    logout,
    getApiKeys,
    createApiKey,
    deleteApiKey,
    renameApiKey
  } from '$lib/auth.js';

  // ─── STATE ───────────────────────────────────
  let loading = true;
  let user = null;

  let keys = [];
  let keysLoading = true;

  // new key form
  let newKeyName = '';
  let creating = false;
  let newKeyResult = null; // { key } — ditampilkan sekali setelah create

  // rename
  let renamingId = null;
  let renameValue = '';

  // delete confirm
  let deletingId = null;

  // ─── INIT ────────────────────────────────────
  onMount(async () => {
    if (!isLoggedIn()) {
      goto('/auth/login');
      return;
    }

    try {
      const res = await getMe();
      user = res?.user ?? res;
    } catch (e) {
      console.error('getMe error:', e);
    }

    loading = false;
    await loadKeys();
  });

  async function loadKeys() {
    keysLoading = true;
    try {
      const res = await getApiKeys();
      keys = res.keys ?? res ?? [];
    } catch (e) {
      console.error(e);
    } finally {
      keysLoading = false;
    }
  }

  // ─── API KEY ACTIONS ──────────────────────────
  async function handleCreate() {
    if (!newKeyName.trim()) return;
    creating = true;
    newKeyResult = null;
    try {
      const res = await createApiKey(newKeyName.trim());
      newKeyResult = res; // simpan raw key untuk ditampilkan
      newKeyName = '';
      await loadKeys();
    } catch (e) {
      console.error(e);
    } finally {
      creating = false;
    }
  }

  async function handleDelete(id) {
    await deleteApiKey(id);
    deletingId = null;
    await loadKeys();
  }

  async function handleRename(id) {
    if (!renameValue.trim()) return;
    await renameApiKey(id, renameValue.trim());
    renamingId = null;
    renameValue = '';
    await loadKeys();
  }

  function startRename(key) {
    renamingId = key.id;
    renameValue = key.name;
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text);
  }

  function handleLogout() {
    logout();
    goto('/auth/login');
  }

  // ─── HELPERS ─────────────────────────────────
  function fmtDate(iso) {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  function initials(u) {
    const name = u?.username || u?.email || '?';
    return name.slice(0, 2).toUpperCase();
  }
</script>

<!-- ════════════════════════════════════════
     LOADING
════════════════════════════════════════ -->
{#if loading}
  <div class="loading" style="padding: 48px 16px;">
    <span class="material-icons spin" style="font-size:32px; color:var(--color-primary)">sync</span>
  </div>

<!-- ════════════════════════════════════════
     MAIN
════════════════════════════════════════ -->
{:else}
<div class="container me-page">

  <!-- ── PROFILE CARD ─────────────────────── -->
  <section class="card me-profile-card">
    <div class="me-avatar-row">
      <div class="avatar me-avatar">
        {initials(user)}
      </div>
      <div class="me-avatar-meta">
        <span class="me-username">
          {user?.username || '—'}
        </span>
        <span class="email me-email">
          {user?.email || user?.id || '—'}
        </span>
        {#if user?.created_at}
          <span class="label">Bergabung {fmtDate(user.created_at)}</span>
        {/if}
      </div>
    </div>

    <div class="me-profile-actions">
      <button class="btn btn-outline-dim me-logout-btn" on:click={handleLogout}>
        <span class="material-icons" style="font-size:16px; margin-right:6px">logout</span>
        Logout
      </button>
    </div>
  </section>

  <!-- ── DIVIDER LABEL ────────────────────── -->
  <div class="me-section-label">
    <span class="material-icons" style="font-size:14px">vpn_key</span>
    API Keys
  </div>

  <!-- ── NEW KEY RESULT BANNER ────────────── -->
  {#if newKeyResult}
    <div class="card me-key-reveal">
      <div class="me-key-reveal-head">
        <span class="material-icons" style="color:var(--color-tertiary);font-size:18px">check_circle</span>
        <span>Key berhasil dibuat. Salin sekarang — tidak akan ditampilkan lagi.</span>
      </div>
      <div class="me-key-raw">
        <code>{newKeyResult.key.key}</code>
        <button class="icon-btn" title="Salin" on:click={() => copyToClipboard(newKeyResult.key.key)}>
          <span class="material-icons" style="font-size:18px">content_copy</span>
        </button>
      </div>
      <button class="btn btn-outline-dim" style="margin-top:8px" on:click={() => newKeyResult = null}>
        Tutup
      </button>
    </div>
  {/if}

  <!-- ── CREATE KEY FORM ──────────────────── -->
  <div class="card">
    <div class="card-header">
      <span class="card-title">Buat API Key Baru</span>
    </div>
    <div class="input-group" style="margin-bottom:0">
      <label class="input-label" for="key-name">Nama Key</label>
      <div class="me-create-row">
        <input
          id="key-name"
          class="input-field"
          type="text"
          placeholder="contoh: cli-local"
          bind:value={newKeyName}
          on:keydown={(e) => e.key === 'Enter' && handleCreate()}
        />
        <button
          class="btn btn-primary me-create-btn"
          on:click={handleCreate}
          disabled={creating || !newKeyName.trim()}
        >
          {#if creating}
            <span class="material-icons spin" style="font-size:16px">sync</span>
          {:else}
            <span class="material-icons" style="font-size:16px">add</span>
          {/if}
        </button>
      </div>
    </div>
  </div>

  <!-- ── KEY LIST ─────────────────────────── -->
  <div class="card" style="padding:0; overflow:hidden;">
    {#if keysLoading}
      <div class="loading" style="padding:32px">
        <span class="material-icons spin" style="font-size:24px;color:var(--color-primary)">sync</span>
      </div>

    {:else if keys.length === 0}
      <div class="empty" style="padding:32px; color:var(--color-text-dim)">
        <span class="material-icons" style="font-size:32px;display:block;margin-bottom:8px">key_off</span>
        Belum ada API key.
      </div>

    {:else}
      <ul class="list">
        {#each keys as key (key.id)}
          <li class="list-item me-key-item">

            <!-- LEFT: name / rename input -->
            <div class="me-key-left">
              {#if renamingId === key.id}
                <div class="me-rename-row">
                  <input
                    class="input-field me-rename-input"
                    bind:value={renameValue}
                    on:keydown={(e) => e.key === 'Enter' && handleRename(key.id)}
                    placeholder="Nama baru"
                  />
                  <button class="icon-btn" on:click={() => handleRename(key.id)} title="Simpan">
                    <span class="material-icons" style="font-size:18px;color:var(--color-primary)">check</span>
                  </button>
                  <button class="icon-btn" on:click={() => renamingId = null} title="Batal">
                    <span class="material-icons" style="font-size:18px">close</span>
                  </button>
                </div>
              {:else}
                <span class="me-key-name">{key.name}</span>
                <span class="label">{fmtDate(key.created_at)}</span>
              {/if}
            </div>

            <!-- RIGHT: actions / delete confirm -->
            <div class="me-key-actions">
              {#if deletingId === key.id}
                <span class="label" style="margin-right:8px">Hapus?</span>
                <button class="icon-btn" on:click={() => handleDelete(key.id)} title="Ya, hapus">
                  <span class="material-icons" style="font-size:18px;color:var(--color-error)">delete_forever</span>
                </button>
                <button class="icon-btn" on:click={() => deletingId = null} title="Batal">
                  <span class="material-icons" style="font-size:18px">close</span>
                </button>
              {:else}
                <button class="icon-btn" on:click={() => startRename(key)} title="Rename">
                  <span class="material-icons" style="font-size:18px">edit</span>
                </button>
                <button class="icon-btn" on:click={() => deletingId = key.id} title="Hapus">
                  <span class="material-icons" style="font-size:18px">delete</span>
                </button>
              {/if}
            </div>

          </li>
        {/each}
      </ul>
    {/if}
  </div>

</div>
{/if}

<style>
  /* ── PAGE WRAPPER ──────────────────────── */
  .me-page {
    max-width: 540px;
    margin: 0 auto;
    padding-top: 24px;
  }

  /* ── PROFILE CARD ──────────────────────── */
  .me-profile-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .me-avatar-row {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .me-avatar {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    font-size: 1.4rem;
    background-color: var(--mat-primary-container);
    color: var(--mat-on-primary-container);
    flex-shrink: 0;
  }

  .me-avatar-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .me-username {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.5px;
    color: var(--color-text-main);
  }

  .me-email {
    font-size: 13px;
    color: var(--color-text-dim);
  }

  .me-profile-actions {
    display: flex;
    justify-content: flex-end;
  }

  .me-logout-btn {
    width: auto;
    margin-bottom: 0;
    display: inline-flex;
    align-items: center;
    padding: 8px 16px;
    font-size: 13px;
  }

  /* ── SECTION LABEL ─────────────────────── */
  .me-section-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-family: var(--font-display);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 1px;
    color: var(--color-text-dim);
    margin: 8px 0 4px;
  }

  /* ── KEY REVEAL BANNER ─────────────────── */
  .me-key-reveal {
    border-color: var(--color-tertiary);
    background-color: rgba(24, 255, 255, 0.05);
  }

  .me-key-reveal-head {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--color-text-dim);
    margin-bottom: 12px;
  }

  .me-key-raw {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: var(--color-base);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 10px 12px;
    overflow-x: auto;
  }

  .me-key-raw code {
    font-family: var(--font-mono);
    font-size: 12px;
    color: var(--color-tertiary);
    flex: 1;
    word-break: break-all;
  }

  /* ── CREATE ROW ────────────────────────── */
  .me-create-row {
    display: flex;
    gap: 8px;
  }

  .me-create-row .input-field {
    flex: 1;
  }

  .me-create-btn {
    width: auto;
    margin-bottom: 0;
    padding: 12px 14px;
    flex-shrink: 0;
  }

  .me-create-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* ── KEY LIST ITEM ─────────────────────── */
  .me-key-item {
    padding: 14px 16px;
  }

  .me-key-left {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .me-key-name {
    font-family: var(--font-mono);
    font-size: 14px;
    color: var(--color-text-main);
  }

  .me-key-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    flex-shrink: 0;
  }

  /* ── RENAME ROW ────────────────────────── */
  .me-rename-row {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .me-rename-input {
    padding: 6px 10px;
    font-size: 13px;
  }
</style>
