<script>
  import { createEventDispatcher } from 'svelte';

  export let tabs = []; 
  // format:
  // [{ label: 'Feed', key: 'feed' }]

  export let active = tabs[0]?.key || '';

  const dispatch = createEventDispatcher();

  function selectTab(key) {
    active = key;
    dispatch('change', { key });
  }
</script>

<!-- HEADER -->
<div class="tabs">
  {#each tabs as tab}
    <button
      class="tab-btn {active === tab.key ? 'active' : ''}"
      on:click={() => selectTab(tab.key)}
    >
      {tab.label}
    </button>
  {/each}
</div>

<!-- CONTENT -->
<div class="tab-content">
  <slot {active} />
</div>
