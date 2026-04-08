<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Tab {
    label: string;
    key: string;
  }

  interface Props {
    tabs: Tab[];
    active: string;
    onChange?: (key: string) => void;
    children?: Snippet<[string]>;
  }

  let { tabs = [], active = $bindable(''), onChange, children }: Props = $props();

  function selectTab(key: string) {
    active = key;
    if (onChange) onChange(key);
  }
</script>

<!-- HEADER -->
<div class="tabs">
  {#each tabs as tab}
    <button
      class="tab-btn {active === tab.key ? 'active' : ''}"
      onclick={() => selectTab(tab.key)}
    >
      {tab.label}
    </button>
  {/each}
</div>

<!-- CONTENT -->
<div class="tab-content">
  {#if children}
    {@render children(active)}
  {/if}
</div>
