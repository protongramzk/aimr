<script>
  import { onMount } from 'svelte';
  import MolCard from '$lib/components/MolCard.svelte';
  import FileView from '$lib/components/FileView.svelte';
  import TabView from '$lib/components/TabView.svelte';
  import { marked } from 'marked';
  import "$lib/leorpiomd.css";
  import { API_BASE } from '$lib/api.js';

  export let params;

  let loading = true;
  let error = '';
let path=[]
  let pkgData = null;
  let files = [];
  let readmeHtml = '';
  let activeTab = 'files';

  const tabs = [
    { label: 'Files', key: 'files' },
    { label: 'README', key: 'readme' }
  ];

  // Fungsi helper untuk mencari file readme dari array tree yang baru
  function findReadme(tree) {
    return tree.find(file => file.name.toLowerCase() === 'read.md' || file.name.toLowerCase() === 'mol.md');
  }
  onMount(async () => {
    try {
      // 1. Fetch data dari API baru
      const response = await fetch(`${API_BASE}/mol/${params.name}`);
      
      if (!response.ok) {
        throw new Error(`Gagal mengambil data: ${response.status}`);
      }

      const data = await response.json();
      
      // Simpan data utama
      pkgData = data;
console.log(pkgData)      
      // 2. Map data tree ke format yang dibutuhkan FileView
      // Karena format baru sudah punya 'name' dan 'fileUrl', kita sesuaikan dikit
     files = data.tree
console.log(files)
      // 3. Handle README kalau ada di dalam tree
      const readmeFile = findReadme(data.tree || []);
      if (readmeFile && readmeFile.fileUrl) {
        const resMd = await fetch(readmeFile.fileUrl);
        const md = await resMd.text();
        readmeHtml = marked.parse(md);
      }

    } catch (err) {
      console.error("🔥 Waduh, error:", err.message);
      error = err.message;
    } finally {
      loading = false;
    }
  });
</script>

{#if loading}
  <div class="loading" style="padding: 48px 16px;">
    <span class="material-icons spin" style="font-size:32px; color:var(--color-primary)">sync</span>
  </div>
{:else if error}
  <p style="padding:16px; color:red">Error : {error}</p>
{:else}
  <div style="padding:16px">
    <MolCard
      username={pkgData.username || 'unknown'}
      name={params.name}
      description={pkgData.description || 'No description available'}
      stars={pkgData.stars}
      downloads={pkgData.downloads}
      atoms={pkgData.atoms_count}
    />
  </div>

<TabView {tabs} bind:active={activeTab}>
  <div slot="default">

    {#if activeTab === 'files'}
      <div style="padding:16px"><FileView
  {files}
  {path}
  on:navigate={(e) => path = e.detail.path}
  on:open={(e) => console.log('OPEN FILE:', e.detail)}
/> </div>
    {/if}

    {#if activeTab === 'readme'}
      <div class="leorpiomd" style="padding:16px">
        {#if readmeHtml}
          {@html readmeHtml}
        {:else}
          <p>README tidak ditemukan.</p>
        {/if}
      </div>
    {/if}

  </div>
</TabView>
{/if}
