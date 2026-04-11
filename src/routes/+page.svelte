<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import TabView from '$lib/components/TabView.svelte';
  import MolCard from '$lib/components/MolCard.svelte';
  import { getPackages, type User } from '$lib/auth';
  import { userStore } from '$lib/stores/user.svelte';

  let loading = $state(false);
  let error = $state('');
  let packages = $state<any[]>([]);
  let activeTab = $state('feed');

  const tabs = [
    { label: 'Feed', key: 'feed' },
    { label: 'Rank', key: 'rank' },
    { label: 'Stars', key: 'stars' },
    { label: 'You', key: 'you' }
  ];

  const TAB_CONFIG: Record<string, { type: string, requireAuth?: boolean }> = {
    feed: { type: 'feed' },
    rank: { type: 'rank' },
    stars: { type: 'stars' },
    you: { type: 'user', requireAuth: true }
  };

  async function fetchPackagesByTab(tabKey: string) {
    const config = TAB_CONFIG[tabKey];
    if (!config) return;

    if (config.requireAuth && !userStore.currentUser) {
      packages = [];
      return;
    }

    loading = true;
    error = '';

    try {
      const res = await getPackages({
        type: config.type,
        username: userStore.currentUser?.username
      });
      packages = res?.packages || [];
    } catch (err: any) {
      error = err.message;
      packages = [];
    } finally {
      loading = false;
    }
  }

  async function handleTabChange(key: string) {
    activeTab = key;
    await fetchPackagesByTab(activeTab);
  }

  // Use an effect to refetch if the user changes while on the "you" tab
  $effect(() => {
    if (activeTab === 'you' || (activeTab === 'feed' && !packages.length)) {
       fetchPackagesByTab(activeTab);
    }
  });

  onMount(async () => {
    // No need to wait for userStore.init() if we already have cached user
    await fetchPackagesByTab("feed");
  });
</script>

<div class="topbar">
  <div class="user-info">
    {#if userStore.currentUser}
      <div class="avatar">
        {userStore.currentUser.username[0].toUpperCase()}
      </div>
      <div class="meta">
        <div class="username">{userStore.currentUser.username}</div>
      </div>
    {:else}
      <div class="avatar guest">
        <span class="material-icons">person_outline</span>
      </div>
      <div class="meta" onclick={() => goto('/auth/login')}>
        <div class="username">Guest</div>
        <small class="login-prompt">Please login first 😏</small>
      </div>
    {/if}
  </div>

  <button class="icon-btn" onclick={() => goto('/settings')}>
    <span class="material-icons">settings</span>
  </button>
</div>

<TabView
  {tabs}
  active={activeTab}
  onChange={handleTabChange}
/>

<div class="container">
  {#if loading}
    <div class="loading">
      <span class="material-icons spin">sync</span>
      <p>Loading...</p>
    </div>

  {:else if error}
    <p class="error">{error}</p>

  {:else if TAB_CONFIG[activeTab]?.requireAuth && !userStore.currentUser}
    <div class="empty">
      <p>Login to view this tab 🔒</p>
      <button class="btn-primary" onclick={() => goto('/auth/login')}>Login</button>
    </div>

  {:else if packages.length === 0}
    <div class="empty">
      <p>No data found 👀</p>
    </div>

  {:else}
    <div class="mol-grid">
      {#each packages as pkg, i}
        <div class="item" onclick={() => goto(`/mol/${pkg.name}`)}>
          {#if activeTab === 'rank'}
            <div class="rank">#{i + 1}</div>
          {/if}

          <MolCard
            username={pkg.username}
            name={pkg.name}
            description={pkg.description || 'No description'}
            stars={pkg.stars_count}
            downloads={pkg.downloads_count}
            atoms={pkg.atoms_count}
          />
        </div>
      {/each}
    </div>
  {/if}
</div>

<style>
  .topbar {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: var(--color-surface);
    border-bottom: 1px solid var(--color-border);
    align-items: center;
  }

  .user-info {
    display: flex;
    gap: 12px;
    align-items: center;
    cursor: pointer;
  }

  .avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--color-surface-2);
    border: 1px solid var(--color-border);
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: var(--color-primary);
  }

  .avatar.guest {
    color: var(--color-text-dim);
  }

  .username {
    font-weight: 600;
    font-size: 14px;
  }

  .login-prompt {
    font-size: 11px;
    color: var(--color-text-dim);
  }

  .container {
    padding: 16px;
  }

  .item {
    margin-bottom: 1px;
  }

  .rank {
    font-weight: bold;
    margin-bottom: 4px;
    font-size: 12px;
    color: var(--color-primary);
  }

  .loading {
    text-align: center;
    padding: 40px;
    color: var(--color-text-dim);
  }

  .spin {
    animation: spin 1s linear infinite;
    font-size: 32px;
    margin-bottom: 8px;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .btn-primary {
    background: var(--color-primary);
    color: var(--color-primary-inv);
    border: none;
    padding: 8px 16px;
    font-weight: bold;
    margin-top: 12px;
    cursor: pointer;
  }

  .empty {
    text-align: center;
    padding: 60px 0;
    color: var(--color-text-dim);
  }
</style>
