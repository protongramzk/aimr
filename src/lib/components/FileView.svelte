<script lang="ts">
  import { onMount, tick } from 'svelte';

  interface FileItem {
    name: string;
    type: 'file' | 'folder';
    children?: FileItem[];
  }

  interface Props {
    files: FileItem[];
    pkg?: string;
  }

  let { files = [], pkg = "my-lib" }: Props = $props();

  const CDN = "https://ueiurduvhlcxgiwxniqb.supabase.co/functions/v1/cdn";

  let stack = $state<FileItem[][]>([files]);
  let folderHistory = $state<string[]>([]);
  let viewMode = $state("list");

  // Viewer state
  let viewerOpen = $state(false);
  let viewerContent = $state("");
  let viewerFile = $state("");
  let viewerLang = $state("javascript");

  let items = $derived(stack[stack.length - 1]);

  function buildPath(fileName: string) {
    return [...folderHistory, fileName].join("/");
  }

  // =====================
  // 📡 FETCH FILE
  // =====================
  async function fetchFile(fullPath: string) {
    try {
      const res = await fetch(`${CDN}?pkg=${pkg}&atoms=${fullPath}`);
      const json = await res.json();
      const url = json.files[fullPath];

      if (!url) throw new Error("File not found");

      return await fetch(url).then(r => r.text());
    } catch (err) {
      console.error(err);
      alert("Failed to load file 😢");
      return "";
    }
  }

  // =====================
  // 🧠 UTIL
  // =====================
  const getExt = (name: string) => name.split(".").pop()?.toLowerCase() || '';

  function mapLang(ext: string) {
    const map: Record<string, string> = {
      js: "javascript",
      ts: "typescript",
      py: "python",
      json: "json",
      html: "markup",
      css: "css",
      yaml: "yaml",
      yml: "yaml",
      md: "markdown"
    };
    return map[ext] || "javascript";
  }

  // =====================
  // 🚀 OPEN FILE
  // =====================
  async function open(item: FileItem) {
    if (item.type === "folder") {
      if (item.children) {
        stack = [...stack, item.children];
        folderHistory = [...folderHistory, item.name];
      }
      return;
    }

    const ext = getExt(item.name);
    const fullPath = buildPath(item.name);
    const content = await fetchFile(fullPath);

    if (ext === "md") return onMDOpen(content, item.name);
    if (ext === "yaml" || ext === "yml") return onYAMLOpen(content, item.name);

    viewerContent = content;
    viewerFile = fullPath;
    viewerLang = mapLang(ext);
    viewerOpen = true;

    tickHighlight();
  }

  function onMDOpen(content: string, name: string) {
    viewerContent = content;
    viewerFile = name;
    viewerLang = "markdown";
    viewerOpen = true;
    tickHighlight();
  }

  function onYAMLOpen(content: string, name: string) {
    viewerContent = content;
    viewerFile = name;
    viewerLang = "yaml";
    viewerOpen = true;
    tickHighlight();
  }

  function tickHighlight() {
    setTimeout(() => {
      // @ts-ignore
      if (window.Prism) window.Prism.highlightAll();
    }, 0);
  }

  // =====================
  // 🎮 CONTROLS
  // =====================
  function closeViewer() {
    viewerOpen = false;
  }

  function copyCode() {
    navigator.clipboard.writeText(viewerContent);
    alert("Copied 🚀");
  }

  function downloadFile() {
    const blob = new Blob([viewerContent], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = viewerFile;
    a.click();
  }

  // =====================
  // 📂 NAV
  // =====================
  function goBack() {
    if (stack.length > 1) {
      stack = stack.slice(0, -1);
      folderHistory = folderHistory.slice(0, -1);
    }
  }

  function goRoot() {
    stack = [files];
    folderHistory = [];
  }

  const getFileIcon = (fileName: string) => {
    const ext = getExt(fileName);
    const map: Record<string, string> = {
      ts: "code",
      js: "code",
      md: "description",
      yaml: "settings",
      yml: "settings",
      json: "data_object"
    };
    return map[ext] || "insert_drive_file";
  };

  let prismTheme = $state("tomorrow");

  const THEMES: Record<string, string> = {
    tomorrow: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-tomorrow.css",
    dark: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-okaidia.css",
    light: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism.css",
    funky: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-funky.css"
  };

  function setTheme(name: string) {
    prismTheme = name;
    const id = "prism-theme";
    let link = document.getElementById(id) as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.id = id;
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    link.href = THEMES[name];
    tickHighlight();
  }

  onMount(() => {
    setTheme("tomorrow");
  });
</script>

<!-- ===================== -->
<!-- 📦 FILE MANAGER -->
<!-- ===================== -->
{#if !viewerOpen}
<div class="wrapper">
  <div class="header">
    <div class="left">
      {#if stack.length > 1}
        <button onclick={goBack} class="icon-btn">
          <span class="material-icons">arrow_back</span>
        </button>
      {/if}

      <div class="path">
        <span class="root" onclick={goRoot}>root</span>
        {#each folderHistory as part}
          <span class="sep">/</span>
          <span>{part}</span>
        {/each}
      </div>
    </div>
  </div>

  <div class="content {viewMode}">
    {#each items as item}
      <div class="item" onclick={() => open(item)}>
        <span class="material-icons icon">
          {item.type === "folder" ? "folder" : getFileIcon(item.name)}
        </span>

        <div class="meta">
          <div class="name">{item.name}</div>
        </div>
      </div>
    {/each}
  </div>
</div>
{/if}

<!-- ===================== -->
<!-- 💻 VIEWER -->
<!-- ===================== -->
{#if viewerOpen}
<div class="viewer">
 <div class="appbar-viewer">
  <div class="left">
    <button class="icon-btn red" onclick={closeViewer}>
      <span class="material-icons">close</span>
    </button>
  </div>

  <div class="center">
    <span class="file" title={viewerFile}>{viewerFile}</span>
  </div>

  <div class="right">
    <button class="icon-btn" onclick={copyCode}>
      <span class="material-icons">content_copy</span>
    </button>

    <button class="icon-btn" onclick={downloadFile}>
      <span class="material-icons">download</span>
    </button>

    <select class="theme-select" onchange={(e) => setTheme((e.target as HTMLSelectElement).value)}>
      {#each Object.keys(THEMES) as t}
        <option value={t} selected={prismTheme === t}>{t}</option>
      {/each}
    </select>
  </div>
</div>
  <!-- 💻 CODE -->
  <pre class="language-{viewerLang}">
    <code>{viewerContent}</code>
  </pre>
</div>
{/if}

<style>
  .wrapper {
    background: #1c1b1f;
    color: #e6e1e5;
    border-radius: 20px;
    border: 1px solid #49454f;
    overflow: hidden;
    max-width: 900px;
    margin: auto;
  }

  .header {
    padding: 12px;
    background: #25232a;
  }

  .path {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 13px;
    font-family: var(--font-mono);
  }

  .root {
    cursor: pointer;
    color: var(--color-primary);
  }

  .sep {
    opacity: 0.5;
  }

  .icon-btn {
    background: transparent;
    border: none;
    color: #d0bcff;
    cursor: pointer;
  }

  .content {
    padding: 10px;
  }

  .item {
    display: flex;
    gap: 10px;
    padding: 10px;
    cursor: pointer;
    align-items: center;
  }

  .item:hover {
    background: rgba(208, 188, 255, 0.1);
  }

  .icon {
    color: #d0bcff;
  }

  /* ===================== */
  /* 💻 VIEWER */
  /* ===================== */
  .viewer {
    position: fixed;
    inset: 0;
    top:60px;
    background: #1c1b1f;
    display: flex;
    flex-direction: column;
    z-index: 200;
  }

  .appbar-viewer {
    width:100%;
    position: fixed;
    bottom: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: #2b2930;
    border-top: 1px solid #49454f;
  }

  .left, .right {
    display: flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }

  .center {
    flex: 1;
    min-width: 0;
    display: flex;
    justify-content: center;
  }

  .file {
    max-width: 100%;
    font-size: 13px;
    opacity: 0.85;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #e6e1e5;
  }

  .icon-btn {
    background: #3a3840;
    border: none;
    padding: 6px;
    border-radius: 8px;
    cursor: pointer;
    color: #e6e1e5;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-btn:hover {
    background: #4a4752;
  }

  .icon-btn.red {
    background: #5c2b2b;
    color: #ffb4ab;
  }

  .icon-btn.red:hover {
    background: #7a3b3b;
  }

  .theme-select {
    background: #3a3840;
    border: none;
    color: #e6e1e5;
    padding: 5px 6px;
    border-radius: 8px;
    font-size: 12px;
    max-width: 90px;
  }

  @media (max-width: 600px) {
    .theme-select {
      display: none;
    }
  }

  pre {
    flex: 1;
    overflow: auto;
    margin: 0;
    padding: 16px;
    background: #1c1b1f !important;
  }
</style>
