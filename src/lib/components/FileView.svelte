<script>
  export let files = [];
  export let pkg = "my-lib"; // 🔥 ganti sesuai package lu

  const CDN = "https://ueiurduvhlcxgiwxniqb.supabase.co/functions/v1/cdn";

  let stack = [files];
  let folderHistory = [];
  let viewMode = "list";

  // 🧠 viewer state
  let viewerOpen = false;
  let viewerContent = "";
  let viewerFile = "";
  let viewerLang = "javascript";

  $: items = stack[stack.length - 1];
function buildPath(fileName) {
  return [...folderHistory, fileName].join("/");
}
  // =====================
  // 📡 FETCH FILE
  // =====================
 async function fetchFile(fullPath) {
  try {
    const res = await fetch(`${CDN}?pkg=${pkg}&atoms=${fullPath}`);
    const json = await res.json();

    const url = json.files[fullPath];

    if (!url) throw new Error("File not found");

    return await fetch(url).then(r => r.text());
  } catch (err) {
    console.error(err);
    alert("Gagal load file 😢");
    return "";
  }
}
  // =====================
  // 🧠 UTIL
  // =====================
  const getExt = (name) => name.split(".").pop().toLowerCase();

  function mapLang(ext) {
    const map = {
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
 async function open(item) {
  if (item.type === "folder") {
    stack = [...stack, item.children];
    folderHistory = [...folderHistory, item.name];
    return;
  }

  const ext = getExt(item.name);

  // 🔥 bikin full path
  const fullPath = buildPath(item.name);

  const content = await fetchFile(fullPath);

  // 🎯 handler
  if (ext === "md") return onMDOpen(content, item.name);
  if (ext === "yaml" || ext === "yml") return onYAMLOpen(content, item.name);

  // 💻 viewer
  viewerContent = content;
  viewerFile = fullPath; // 🔥 biar keliatan path asli
  viewerLang = mapLang(ext);
  viewerOpen = true;

  tickHighlight();
}
  function onMDOpen(content, name) {
    viewerContent = content;
    viewerFile = name;
    viewerLang = "markdown";
    viewerOpen = true;
    tickHighlight();
  }

  function onYAMLOpen(content, name) {
    viewerContent = content;
    viewerFile = name;
    viewerLang = "yaml";
    viewerOpen = true;
    tickHighlight();
  }

  function tickHighlight() {
    setTimeout(() => {
      if (window.Prism) Prism.highlightAll();
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

  const getFileIcon = (fileName) => {
    const ext = getExt(fileName);
    const map = {
      ts: "code",
      js: "code",
      md: "description",
      yaml: "settings",
      yml: "settings",
      json: "data_object"
    };
    return map[ext] || "insert_drive_file";
  };
let theme = "tomorrow";

const THEMES = {
  tomorrow: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-tomorrow.css",
  dark: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-okaidia.css",
  light: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism.css",
  funky: "https://cdn.jsdelivr.net/npm/prismjs/themes/prism-funky.css"
};
function setTheme(name) {
  theme = name;

  const id = "prism-theme";
  let link = document.getElementById(id);

  if (!link) {
    link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }

  link.href = THEMES[name];

  tickHighlight();
}
</script>

<!-- ===================== -->
<!-- 📦 FILE MANAGER -->
<!-- ===================== -->
{#if !viewerOpen}
<div class="wrapper">
  <div class="header">
    <div class="left">
      {#if stack.length > 1}
        <button on:click={goBack} class="icon-btn">
          <span class="material-icons">arrow_back</span>
        </button>
      {/if}

      <div class="path">
        <span class="root" on:click={goRoot}>root</span>
        {#each folderHistory as part}
          <span class="sep">/</span>
          <span>{part}</span>
        {/each}
      </div>
    </div>
  </div>

  <div class="content {viewMode}">
    {#each items as item}
      <div class="item" on:click={() => open(item)}>
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
 <div class="appbar">
  <div class="left">
    <button class="icon-btn red" on:click={closeViewer}>
      <span class="material-icons">close</span>
    </button>
  </div>

  <div class="center">
    <span class="file" title={viewerFile}>{viewerFile}</span>
  </div>

  <div class="right">
    <button class="icon-btn" on:click={copyCode}>
      <span class="material-icons">content_copy</span>
    </button>

    <button class="icon-btn" on:click={downloadFile}>
      <span class="material-icons">download</span>
    </button>

    <select class="theme-select" on:change={(e) => setTheme(e.target.value)}>
      {#each Object.keys(THEMES) as t}
        <option value={t}>{t}</option>
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

  .icon-btn {
    background: transparent;
    border: none;
    color: #d0bcff;
  }

  .content {
    padding: 10px;
  }

  .item {
    display: flex;
    gap: 10px;
    padding: 10px;
    cursor: pointer;
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
  }
.appbar {
  width:100%;
  position: fixed;
  bottom: 0;
  z-index: 10;

  display: flex;
  align-items: center;
  gap: 8px;

  padding: 0px 0px;
  background: #2b2930;
  border-bottom: 1px solid #49454f;

  overflow: hidden; /* 🔥 anti bocor */
}

/* kiri & kanan fix size */
.left,
.right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* tengah fleksibel */
.center {
  flex: 1;
  min-width: 0; /* 🔥 WAJIB biar bisa truncate */
  display: flex;
  justify-content: center;
}

/* nama file */
.file {
  max-width: 100%;
  font-size: 13px;
  opacity: 0.85;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* tombol */
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

  flex-shrink: 0;
}

.icon-btn:hover {
  background: #4a4752;
}

/* close merah */
.icon-btn.red {
  background: #5c2b2b;
  color: #ffb4ab;
}

.icon-btn.red:hover {
  background: #7a3b3b;
}

/* select */
.theme-select {
  background: #3a3840;
  border: none;
  color: #e6e1e5;
  padding: 5px 6px;
  border-radius: 8px;
  font-size: 12px;

  max-width: 90px; /* 🔥 biar gak rakus tempat */
}

/* 📱 MOBILE MODE */
@media (max-width: 600px) {
  .theme-select {
    display: none; /* 🔥 sembunyiin biar lega */
  }

  .file {
    font-size: 12px;
  }

  .icon-btn {
    padding: 5px;
  }
}
  pre {
    flex: 1;
    overflow: auto;
    margin: 0;
    padding: 16px;
  }
</style>

