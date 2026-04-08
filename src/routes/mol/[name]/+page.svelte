<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import MolCard from '$lib/components/MolCard.svelte';
  import FileView from '$lib/components/FileView.svelte';
  import TabView from '$lib/components/TabView.svelte';
  import { marked } from 'marked';
  import { userStore } from '$lib/stores/user.svelte';
  import "$lib/leorpiomd.css";

  const API_BASE = "https://aipm-tawny.vercel.app";

  let loading = $state(true);
  let error = $state('');
  let pkgData = $state<any>(null);
  let files = $state<any[]>([]);
  let readmeHtml = $state('');
  let activeTab = $state('readme');

  const tabs = [
    { label: 'Molecule Info', key: 'readme' },
    { label: 'Files', key: 'files' },
  ];

  function findReadme(tree: any[]) {
    return tree.find(file =>
      file.name.toLowerCase() === 'read.md' ||
      file.name.toLowerCase() === 'mol.md' ||
      file.name.toLowerCase() === 'readme.md'
    );
  }

  onMount(async () => {
    const name = $page.params.name;
    try {
      const response = await fetch(`${API_BASE}/mol/${name}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.status}`);
      }

      const data = await response.json();
      pkgData = data;
      files = data.tree || [];

      const readmeFile = findReadme(files);
      if (readmeFile && readmeFile.fileUrl) {
        const resMd = await fetch(readmeFile.fileUrl);
        const md = await resMd.text();
        readmeHtml = await marked.parse(md);
      }

    } catch (err: any) {
      console.error("Error fetching molecule:", err.message);
      error = err.message;
    } finally {
      loading = false;
    }
  });

  async function handleTabChange(key: string) {
    activeTab = key;
  }
</script>

{#if loading}
  <div class="loading-container">
    <span class="material-icons spin">sync</span>
    <p>Loading Molecule...</p>
  </div>
{:else if error}
  <div class="container">
    <p class="error-msg">Error: {error}</p>
    <button class="btn-primary" onclick={() => window.location.reload()}>Retry</button>
  </div>
{:else}
  <div class="container">
    <MolCard
      username={pkgData.username || 'unknown'}
      name={pkgData.name || $page.params.name}
      description={pkgData.description || 'No description available'}
      stars={pkgData.stars || 0}
      downloads={pkgData.downloads || 0}
      atoms={pkgData.atoms_count || 0}
    />
  </div>

  <TabView
    {tabs}
    active={activeTab}
    onChange={handleTabChange}
  >
    {#if activeTab === 'files'}
      <div class="tab-pane">
        <FileView {files} pkg={$page.params.name} />
      </div>
    {/if}

    {#if activeTab === 'readme'}
      <div class="tab-pane">
        <div class="leorpiomd">
          {#if readmeHtml}
            {@html readmeHtml}
          {:else}
            <p class="empty-text">README not found.</p>
          {/if}
        </div>
      </div>
    {/if}
  </TabView>
{/if}

<style>
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px 16px;
    color: var(--color-text-dim);
  }

  .spin {
    animation: spin 1s linear infinite;
    font-size: 32px;
    color: var(--color-primary);
    margin-bottom: 12px;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .error-msg {
    color: var(--color-error);
    background: rgba(255, 68, 68, 0.1);
    padding: 16px;
    border: 1px solid var(--color-error);
    margin: 16px 0;
  }

  .tab-pane {
    padding: 16px;
  }

  .empty-text {
    color: var(--color-text-dim);
    font-style: italic;
    text-align: center;
    padding: 40px;
  }

  .btn-primary {
    background: var(--color-primary);
    color: var(--color-primary-inv);
    border: none;
    padding: 10px 20px;
    font-weight: 800;
    cursor: pointer;
  }
</style>
