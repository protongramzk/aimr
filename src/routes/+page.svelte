<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import TabView from '$lib/components/TabView.svelte';
  import MolCard from '$lib/components/MolCard.svelte';

  import {
    getMe,
    getPackages,
    isLoggedIn
  } from '$lib/auth.js';

  let loading = false;
  let error = '';
  let packages = [];
  let currentUser = null;
  let activeTab = 'feed';

  const tabs = [
    { label: 'Feed', key: 'feed' },
    { label: 'Rank', key: 'rank' },
    { label: 'Stars', key: 'stars' },
    { label: 'You', key: 'you' }
  ];

  // 🎯 pusat logic
  const TAB_CONFIG = {
    feed: { type: 'feed' },
    rank: { type: 'rank' },
    stars: { type: 'stars' }, // nanti bisa beda endpoint
    you: { type: 'user', requireAuth: true }
  };

  // =========================
  // 👤 USER
  // =========================
  async function fetchMe() {
    if (!isLoggedIn()) return;

    try {
      const res = await getMe();
      currentUser = res.user ?? res;
    } catch {
      currentUser = null;
    }
  }

  // =========================
  // 📦 FETCH CORE
  // =========================
  async function fetchPackagesByTab(tabKey) {
    const config = TAB_CONFIG[tabKey];

    if (!config) return;

    // 🔐 auth check
    if (config.requireAuth && !currentUser) {
      packages = [];
      return;
    }

    loading = true;
    error = '';

    try {
      let res;

      // 🔥 unified request
      res = await getPackages({
        type: config.type,
        username: currentUser?.username
      });

      packages = res?.packages || [];

    } catch (err) {
      error = err.message;
      packages = [];
    } finally {
      loading = false;
    }
  }

  // =========================
  // 🔁 TAB CHANGE
  // =========================
  async function handleTabChange(e) {
    activeTab = e.detail.key;
    await fetchPackagesByTab(activeTab);
  }

  // =========================
  // 🚀 INIT
  // =========================
  onMount(async () => {
    await fetchMe();
    await fetchPackagesByTab("feed");
  });
</script>

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">

<!-- ========================= -->
<!-- 🔝 TOPBAR -->
<!-- ========================= -->
<div class="topbar">
  <div class="user-info">
    {#if currentUser}
      <div class="avatar">
        {currentUser.username[0].toUpperCase()}
      </div>
      <div class="meta">
        <div>{currentUser.username}</div>
      </div>
    {:else}
      <div class="avatar guest">
        <span class="material-icons">person_outline</span>
      </div>
      <div class="meta" on:click={() => goto('/auth/login')}>
        <div>Guest</div>
        <small>Login dulu bro 😏</small>
      </div>
    {/if}
  </div>

  <button class="icon-btn" on:click={() => goto('/me')}>
    <span class="material-icons">settings</span>
  </button>
</div>

<!-- ========================= -->
<!-- 📊 TABS -->
<!-- ========================= -->
<TabView
  {tabs}
  active={activeTab}
  on:change={handleTabChange}
/>

<!-- ========================= -->
<!-- 📦 CONTENT -->
<!-- ========================= -->
<div class="container">
  {#if loading}
    <div class="loading">
      <span class="material-icons spin">sync</span>
      <p>Loading...</p>
    </div>

  {:else if error}
    <p class="error">{error}</p>

  {:else if TAB_CONFIG[activeTab]?.requireAuth && !currentUser}
    <div class="empty">
      <p>Login dulu buat buka tab ini 🔒</p>
      <button on:click={() => goto('/auth/login')}>Login</button>
    </div>

  {:else if packages.length === 0}
    <div class="empty">
      <p>Belum ada data 👀</p>
    </div>

  {:else}
    {#each packages as pkg, i}
      <div class="item" on:click={() => goto(`/mol/${pkg.name}`)}>
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
  {/if}
</div>

<style>
.topbar {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  background: #111;
  color: white;
}

.user-info {
  display: flex;
  gap: 10px;
  align-items: center;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #444;
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  padding: 10px;
}

.item {
  margin-bottom: 10px;
}

.rank {
  font-weight: bold;
  margin-bottom: 4px;
}

.loading {
  text-align: center;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
