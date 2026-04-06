<script>
  import { login, isLoggedIn } from '$lib/auth.js'
  import { goto } from '$app/navigation'
  import { onMount } from 'svelte'

  let email = ''
  let password = ''
  let loading = false
  let error = ''
  let rememberMe = true

  onMount(() => {
    if (isLoggedIn()) goto('/')
  })

  async function handleLogin() {
    loading = true
    error = ''

    if (!email || !password) {
      error = 'Please enter email and password'
      loading = false
      return
    }

    try {
      await login(email, password)
      goto('/')
    } catch (err) {
      error = err.message || 'Login failed'
    } finally {
      loading = false
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !loading) handleLogin()
  }
</script>

<div class="container">
  <div class="card">

    <div class="card-header">
      <span class="card-title">Sign In</span>
      <span class="material-icons" style="color: var(--color-text-dim); font-size: 18px;">lock</span>
    </div>

    <div class="input-group">
      <label class="input-label" for="email">Email</label>
      <div style="position: relative; display: flex; align-items: center;">
        <span class="material-icons" style="position: absolute; left: 12px; font-size: 18px; color: var(--color-text-dim); pointer-events: none;">mail</span>
        <input
          id="email"
          class="input-field input-with-icon"
          bind:value={email}
          type="email"
          placeholder="email@domain.com"
          disabled={loading}
          on:keydown={handleKeydown}
        />
      </div>
    </div>

    <div class="input-group">
      <label class="input-label" for="password">Password</label>
      <div style="position: relative; display: flex; align-items: center;">
        <span class="material-icons" style="position: absolute; left: 12px; font-size: 18px; color: var(--color-text-dim); pointer-events: none;">key</span>
        <input
          id="password"
          class="input-field input-with-icon"
          bind:value={password}
          type="password"
          placeholder="Password"
          disabled={loading}
          on:keydown={handleKeydown}
        />
      </div>
    </div>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
      <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
        <input
          class="toggle-switch"
          type="checkbox"
          bind:checked={rememberMe}
          disabled={loading}
        />
        <span class="sub">Remember me</span>
      </label>
      <a href="/forgot" class="sub-link">Forgot?</a>
    </div>

    {#if error}
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
        <span class="material-icons" style="font-size: 16px; color: var(--color-error);">error_outline</span>
        <p class="error" style="margin: 0;">{error}</p>
      </div>
    {/if}

    <button class="btn btn-primary" on:click={handleLogin} disabled={loading}>
      {#if loading}
        <span class="material-icons spin" style="font-size: 16px; margin-right: 6px;">autorenew</span>
        Processing...
      {:else}
        Sign In
        <span class="material-icons" style="font-size: 16px; margin-left: 6px;">arrow_forward</span>
      {/if}
    </button>

    <p class="sub" style="text-align: center; margin-top: 8px;">
      New here? <a href="/auth/register" class="sub-link" style="display: inline;">Create an account</a>
    </p>

  </div>
</div>
