<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import TabView from '$lib/components/TabView.svelte'
  import MolCard from '$lib/components/MolCard.svelte'
  import {
    getMe,
    getPackages,
    isLoggedIn,
    getSession
  } from '$lib/auth.js';

  let loading = false;
  let error = '';
  let packages = [];
  let currentUser = null;

  let activeTab = 'feed';
  let tabs = ['feed', 'rank', 'stars', 'you'];

  // =========================
  // 👤 GET USER
  // =========================
  async function fetchMe() {
    if (!isLoggedIn()) return;

    try {
      const res = await getMe();
      // Struktur: { id, username, created_at }
      currentUser = res.user ?? res;
    } catch (err) {
      console.log('ME ERROR:', err);
      currentUser = null;
    }
  }

  // =========================
  // 📦 GET PACKAGES
  // =========================
  async function fetchPackages() {
    loading = true;
    error = '';

    try {
      let data;

      if (activeTab === 'rank') {
        data = await getPackages({ type: 'rank' });

      } else if (activeTab === 'feed') {
        data = await getPackages({ type: 'feed' });

      } else if (activeTab === 'you') {
        if (!currentUser) {
          packages = [];
          return;
        }

        data = await getPackages({
          type: 'user',
          username: currentUser.username   // ✅ langsung dari root
        });
      }

      packages = data?.packages || [];

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
  async function handleTabChange(tab) {
    activeTab = tab;

    if (tab === 'stars') {
      await fetchStars();
    } else {
      await fetchPackages();
    }
  }

  // =========================
  // 🚀 INIT
  // =========================
  onMount(async () => {
    await fetchMe();
    await fetchPackages();
  });
</script>

<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
<div class="topbar">
  <div class="user-info">
    {#if currentUser}
      <div class="avatar-container">
        <div class="avatar">
          {currentUser.username[0].toUpperCase()}  <!-- ✅ pakai username -->
        </div>
        <div class="online-indicator"></div>
      </div>
      <div class="meta">
        <span class="label">Welcome back,</span>
        <div class="email">{currentUser.username}</div>  <!-- ✅ pakai username -->
      </div>
    {:else}
      <div class="avatar guest">
        <span class="material-icons">person_outline</span>
      </div>
      <div class="meta" on:click={()=>goto('/auth/login')}>
        <div class="email">Guest User</div>
        <div class="sub-link">
           <span class="material-icons">login</span> 
           <span>Sign in to sync</span>
        </div>
      </div>
    {/if}
  </div>

  <button class="icon-btn" on:click={() => goto('/me')} aria-label="Settings">
    <span class="material-icons">settings</span>
  </button>
</div>

<TabView
  {tabs}
  active={activeTab}
  on:change={handleTabChange}
/>

<div class="container">
  {#if loading}
    <div class="loading">
      <span class="material-icons spin">sync</span>
      <p>Loading...</p>
    </div>

  {:else if error}
    <p class="error">{error}</p>

  {:else if activeTab === 'you' && !currentUser}
    <div class="empty">
      <p>Login first to see your profile <span class="material-icons">visibility</span></p>
      <a href="/auth/login">Login</a>
    </div>

  {:else}
    {#each packages as pkg, i}
      {#if activeTab === 'stars'}
        <div class="rank">#{i + 1}</div>
      {/if}

      <div on:click={() => goto(`/mol/${pkg.name}`)}>
        <MolCard
          username={pkg.username}
          name={pkg.name}
          description={pkg.description || 'No description'}
          stars={pkg.stars_count}
          downloads={pkg.downloads}
          atoms={pkg.atoms_count}
        />   <!-- ✅ hapus }} dobel -->
      </div>
    {/each}
  {/if}
</div>
