<script lang="ts">
  interface Props {
    username: string;
    name: string;
    description: string;
    stars: number;
    downloads: number;
    atoms: number;
  }

  let {
    username = '',
    name = '',
    description = '',
    stars = 0,
    downloads = 0,
    atoms = 0
  }: Props = $props();

  let fullName = $derived(`@${username}/${name}`);
</script>

<div class="mol-card">
  <div class="mol-title">{fullName}</div>

  <div class="mol-desc">
    {description}
  </div>

  <div class="mol-stats">
    <div class="stat-item" style="cursor: pointer;">
      <i class="material-icons">star</i>
      {stars} Stars
    </div>
    <div class="stat-item"><i class="material-icons">download</i> {downloads} Downloads</div>
    <div class="stat-item"><i class="material-icons">snowing</i> {atoms} Atoms</div>
  </div>
</div>
