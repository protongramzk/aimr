<script lang="ts">
  import { login } from '$lib/auth';
  import { goto } from '$app/navigation';
  import { userStore } from '$lib/stores/user.svelte';

  let email = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state('');

  async function handleSubmit(e: Event) {
    e.preventDefault();
    loading = true;
    error = '';

    try {
      await login(email, password);
      await userStore.init();
      goto('/');
    } catch (err: any) {
      error = err.message || 'Login failed';
    } finally {
      loading = false;
    }
  }
</script>

<div class="auth-page">
  <div class="auth-card">
    <h1 class="auth-title">Login</h1>
    <p class="auth-subtitle">Welcome back to atomol</p>

    <form onsubmit={handleSubmit} class="auth-form">
      <div class="boxy-input-group">
        <label class="boxy-label" for="email">Email</label>
        <input
          id="email"
          type="email"
          class="boxy-text-input"
          placeholder="your@email.com"
          bind:value={email}
          required
        />
      </div>

      <div class="boxy-input-group">
        <label class="boxy-label" for="password">Password</label>
        <input
          id="password"
          type="password"
          class="boxy-text-input"
          placeholder="••••••••"
          bind:value={password}
          required
        />
      </div>

      {#if error}
        <p class="error-msg">{error}</p>
      {/if}

      <button type="submit" class="auth-btn" disabled={loading}>
        {#if loading}
          <span class="material-icons spin">sync</span>
        {:else}
          Login
        {/if}
      </button>
    </form>

    <div class="auth-footer">
      <span>Don't have an account?</span>
      <a href="/auth/register">Register</a>
    </div>
  </div>
</div>

<style>
  .auth-page {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 80vh;
    padding: 16px;
  }

  .auth-card {
    width: 100%;
    max-width: 400px;
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    padding: 32px;
  }

  .auth-title {
    font-size: 24px;
    font-weight: 800;
    margin: 0 0 8px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .auth-subtitle {
    color: var(--color-text-dim);
    font-size: 14px;
    margin-bottom: 32px;
  }

  .auth-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .auth-btn {
    background: var(--color-primary);
    color: var(--color-primary-inv);
    border: none;
    padding: 14px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    margin-top: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .auth-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .error-msg {
    color: var(--color-error);
    font-size: 13px;
    margin: 0;
  }

  .auth-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 14px;
    color: var(--color-text-dim);
  }

  .auth-footer a {
    color: var(--color-primary);
    text-decoration: none;
    font-weight: 600;
    margin-left: 4px;
  }

  .spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
</style>
