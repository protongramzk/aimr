<script>
  /**
   * @typedef {'file' | 'folder'} NodeType
   * @typedef {{ name: string, type: NodeType, fileUrl: string | null, children: TreeNode[] }} TreeNode
   * @typedef {{ tree: TreeNode[] }} FileTree
   */

  /** @type {FileTree} */
  export let files=[]
  const data=files

  // Stack navigasi: [rootItems, folderAItems, folderBItems, ...]
  let stack = [files];

  // History nama folder untuk breadcrumb
  let folderHistory = [];

  let viewMode = 'list';

  // Items aktif = ujung stack
  $: items = stack[stack.length - 1];

  const open = (/** @type {TreeNode} */ item) => {
    if (item.type === 'folder') {
      stack = [...stack, item.children];
      folderHistory = [...folderHistory, item.name];
    } else if (item.fileUrl) {
      window.open(item.fileUrl, '_blank');
    }
  };

  const goBack = () => {
    if (stack.length > 1) {
      stack = stack.slice(0, -1);
      folderHistory = folderHistory.slice(0, -1);
    }
  };

  const goRoot = () => {
    stack = [data.tree];
    folderHistory = [];
  };

  const getPathNames = () => folderHistory;

  const getFileIcon = (/** @type {string} */ fileName) => {
    if (!fileName) return 'insert_drive_file';
    const ext = fileName.split('.').pop().toLowerCase();
    const map = {
      ts: 'code', js: 'code',
      md: 'description',
      yaml: 'settings', yml: 'settings',
      json: 'data_object',
    };
    return map[ext] || 'insert_drive_file';
  };
</script>
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
        {#each getPathNames() as part}
          <span class="sep">/</span>
          <span>{part}</span>
        {/each}
      </div>
    </div>

    <div class="view-toggle">
      <button
        class:active={viewMode === 'list'}
        on:click={() => viewMode = 'list'}>
        <span class="material-icons">view_list</span>
      </button>

      <button
        class:active={viewMode === 'grid'}
        on:click={() => viewMode = 'grid'}>
        <span class="material-icons">grid_view</span>
      </button>
    </div>
  </div>

  <div class="content {viewMode}">
    {#each items as item}
      <div class="item" on:click={() => open(item)}>
        <span class="material-icons icon">
          {item.type === 'folder' ? 'folder' : getFileIcon(item.name)}
        </span>

        <div class="meta">
          <div class="name">{item.name}</div>
          {#if item.type === 'file' && viewMode === 'list'}
            <div class="type">
              {item.name.split('.').pop()} file
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if items.length === 0}
      <div class="empty">
        <span class="material-icons big">folder_open</span>
        <p>Empty</p>
      </div>
    {/if}
  </div>
</div>

<style>
  /* Style tetap sama seperti yang kamu buat, sudah solid! */
  .wrapper {
    background: #1c1b1f;
    color: #e6e1e5;
    border-radius: 20px;
    border: 1px solid #49454f;
    overflow: hidden;
    max-width: 900px;
    margin: auto;
    font-family: system-ui;
  }
  .header {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: #25232a;
    border-bottom: 1px solid #49454f;
  }
  .left {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .icon-btn {
    background: transparent;
    border: none;
    color: #d0bcff;
    cursor: pointer;
    display: flex;
    align-items: center;
  }
  .path {
    font-size: 13px;
    color: #aaa;
  }
  .root {
    color: #d0bcff;
    cursor: pointer;
    font-weight: 500;
  }
  .root:hover {
    text-decoration: underline;
  }
  .sep {
    margin: 0 6px;
    opacity: 0.5;
  }
  .view-toggle {
    display: flex;
    background: #1c1b1f;
    padding: 4px;
    border-radius: 12px;
  }
  .view-toggle button {
    background: transparent;
    border: none;
    color: #cac4d0;
    padding: 6px;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
  }
  .view-toggle button.active {
    background: #d0bcff;
    color: #381e72;
  }
  .content.grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 12px;
    padding: 16px;
  }
  .content.list {
    display: flex;
    flex-direction: column;
    padding: 8px;
  }
  .item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 12px;
    cursor: pointer;
    transition: 0.2s ease;
    border: 1px solid transparent;
  }
  .grid .item {
    flex-direction: column;
    text-align: center;
    padding: 20px 10px;
  }
  .item:hover {
    background: rgba(208, 188, 255, 0.08);
    border-color: #49454f;
  }
  .icon {
    font-size: 28px;
    color: #d0bcff;
  }
  .grid .icon {
    font-size: 48px;
  }
  .meta {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    width: 100%;
  }
  .name {
    font-size: 13px;
    word-break: break-all;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .grid .name {
    white-space: normal;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .type {
    font-size: 10px;
    opacity: 0.5;
    text-transform: uppercase;
  }
  .empty {
    text-align: center;
    opacity: 0.4;
    padding: 60px 20px;
  }
  .big {
    font-size: 64px;
    margin-bottom: 8px;
  }
</style>

