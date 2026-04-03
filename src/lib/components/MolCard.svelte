<script>
  export let username = '';
  export let name = '';
  export let description = '';
  export let stars = 0;
  export let downloads = 0;
  export let atoms = 0;

  // helper kecil biar rapi
  $: fullName = `@${username}/${name}`;
</script>

<div class="mol-card">
  <div class="mol-title">{fullName}</div>

  <div class="mol-desc">
    {description}
  </div>

  <div class="mol-stats">
<div class="stat-item" style="cursor: pointer;">
  <i class="material-icons">
    star
  </i>
  {stars} Stars
</div>
    <div class="stat-item"><i class="material-icons">download</i> {downloads} Downloads</div>
    <div class="stat-item"><i class="material-icons">snowing</i> {atoms} Atoms</div>
  </div>
</div>
