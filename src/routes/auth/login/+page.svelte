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
    if (isLoggedIn()) {
      goto('/')
    }
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
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }
</script>

<div class="login-container">
  <div class="header">
    <div class="logo-icon">
      <span class="material-icons">lock</span>
    </div>
    <h2>Welcome Back</h2>
    <p>Sign in to continue to your dashboard</p>
  </div>

  <div class="form">
    <div class="input-group">
      <span class="material-icons field-icon">mail</span>
      <input
        bind:value={email}
        type="email"
        placeholder="Email Address"
        disabled={loading}
        on:keydown={handleKeydown}
      />
    </div>

    <div class="input-group">
      <span class="material-icons field-icon">key</span>
      <input
        bind:value={password}
        type="password"
        placeholder="Password"
        disabled={loading}
        on:keydown={handleKeydown}
      />
    </div>

    <div class="actions">
      <label class="checkbox-container">
        <input type="checkbox" bind:checked={rememberMe} disabled={loading} />
        <span class="checkmark"></span>
        <span class="label-text">Remember me</span>
      </label>
      <a href="/forgot" class="forgot-link">Forgot?</a>
    </div>

    <button class="login-btn" on:click={handleLogin} disabled={loading}>
      {#if loading}
        <span class="spinner"></span>
        <span>Processing...</span>
      {:else}
        <span>Sign In</span>
        <span class="material-icons">arrow_forward</span>
      {/if}
    </button>

    {#if error}
      <div class="error-box">
        <span class="material-icons">error_outline</span>
        <p>{error}</p>
      </div>
    {/if}

    <p class="register-link">
      New here? <a href="/register">Create an account</a>
    </p>
  </div>
</div>

<style>
  :root {
    --bg-dark: #1c1b1f;
    --surface: #2b2930;
    --primary: #d0bcff;
    --on-primary: #381e72;
    --secondary: #ccc2dc;
    --error: #f2b8b5;
    --outline: #938f99;
  }

  .login-container {
    max-width: 420px;
    margin: 60px auto;
    padding: 32px 24px;
    background-color: var(--surface);
    border-radius: 28px; /* Material 3 large radius */
    color: #e6e1e5;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  }

  .header {
    text-align: center;
    margin-bottom: 32px;
  }

  .logo-icon {
    width: 56px;
    height: 56px;
    background-color: var(--primary);
    color: var(--on-primary);
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 16px;
  }

  h2 {
    font-size: 1.75rem;
    font-weight: 500;
    margin: 0;
  }

  .header p {
    color: var(--outline);
    font-size: 0.9rem;
    margin-top: 8px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .input-group {
    position: relative;
    display: flex;
    align-items: center;
  }

  .field-icon {
    position: absolute;
    left: 16px;
    color: var(--outline);
    font-size: 20px;
  }

  input[type='email'],
  input[type='password'] {
    width: 100%;
    padding: 16px 16px 16px 48px;
    background-color: transparent;
    border: 1px solid var(--outline);
    border-radius: 12px;
    color: white;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 1px var(--primary);
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 4px;
  }

  /* Custom Checkbox */
  .checkbox-container {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    font-size: 0.85rem;
  }

  .checkbox-container input { display: none; }

  .checkmark {
    width: 18px;
    height: 18px;
    border: 2px solid var(--outline);
    border-radius: 4px;
    position: relative;
  }

  .checkbox-container input:checked ~ .checkmark {
    background-color: var(--primary);
    border-color: var(--primary);
  }

  .checkbox-container input:checked ~ .checkmark::after {
    content: '✓';
    position: absolute;
    color: var(--on-primary);
    font-size: 12px;
    left: 3px;
    top: -1px;
    font-weight: bold;
  }

  .forgot-link {
    color: var(--primary);
    text-decoration: none;
    font-size: 0.85rem;
  }

  .login-btn {
    margin-top: 8px;
    padding: 16px;
    background-color: var(--primary);
    color: var(--on-primary);
    border: none;
    border-radius: 100px; /* Fully rounded button */
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    transition: transform 0.2s;
  }

  .login-btn:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  .login-btn:active {
    transform: scale(0.98);
  }

  .login-btn:disabled {
    background-color: var(--outline);
    cursor: not-allowed;
  }

  .error-box {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: rgba(242, 184, 181, 0.1);
    color: var(--error);
    padding: 12px;
    border-radius: 12px;
    font-size: 0.85rem;
  }

  .register-link {
    text-align: center;
    font-size: 0.85rem;
    color: var(--outline);
    margin-top: 16px;
  }

  .register-link a {
    color: var(--primary);
    text-decoration: none;
    font-weight: 600;
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid var(--on-primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
