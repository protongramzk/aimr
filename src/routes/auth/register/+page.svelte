<script>
  import { register } from '/lib.js'
  import { goto } from '$app/navigation'

  let email = ''
  let password = ''
  let username = ''
  let loading = false
  let error = ''
  let success = ''

  async function handleRegister() {
    loading = true
    error = ''
    success = ''

    // Validate
    if (!email || !password || !username) {
      error = 'Please fill all fields'
      loading = false
      return
    }

    if (password.length < 6) {
      error = 'Password must be at least 6 characters'
      loading = false
      return
    }

    try {
      // Register using lib.js
      const user = await register(email, password, username)

      success = `Welcome ${user.username || email}! Redirecting...`
      
      // Token automatically saved to localStorage by lib.js
      // User automatically saved to localStorage by lib.js
      
      // Redirect after 1 second
      setTimeout(() => {
        goto('/')
      }, 1000)
    } catch (err) {
      error = err.message || 'Registration failed'
      console.error('Register error:', err)
    } finally {
      loading = false
    }
  }

  // Allow enter key to submit
  function handleKeydown(e) {
    if (e.key === 'Enter' && !loading) {
      handleRegister()
    }
  }
</script>

<h2>Create Account</h2>

<div class="form">
  <input
    bind:value={email}
    type="email"
    placeholder="Email"
    disabled={loading}
    on:keydown={handleKeydown}
  />
  
  <input
    bind:value={username}
    type="text"
    placeholder="Username"
    disabled={loading}
    on:keydown={handleKeydown}
  />
  
  <input
    bind:value={password}
    type="password"
    placeholder="Password (min 6 chars)"
    disabled={loading}
    on:keydown={handleKeydown}
  />

  <button on:click={handleRegister} disabled={loading}>
    {loading ? '⏳ Creating account...' : '✨ Register'}
  </button>

  {#if error}
    <p class="error">❌ {error}</p>
  {/if}

  {#if success}
    <p class="success">✅ {success}</p>
  {/if}

  <p class="link">
    Already have an account? <a href="/login">Login here</a>
  </p>
</div>

<style>
  h2 {
    margin-bottom: 20px;
    color: #333;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 20px;
    max-width: 400px;
    margin: 0 auto;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  input {
    padding: 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
    font-family: inherit;
    transition: border-color 0.2s;
  }

  input:focus {
    outline: none;
    border-color: #4CAF50;
    box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
  }

  input:disabled {
    background-color: #f0f0f0;
    cursor: not-allowed;
  }

  button {
    padding: 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  button:hover:not(:disabled) {
    background-color: #45a049;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }

  .error {
    color: #d32f2f;
    font-size: 13px;
    padding: 10px;
    background-color: #ffebee;
    border-radius: 4px;
    margin: 0;
  }

  .success {
    color: #388e3c;
    font-size: 13px;
    padding: 10px;
    background-color: #e8f5e9;
    border-radius: 4px;
    margin: 0;
  }

  .link {
    text-align: center;
    font-size: 13px;
    color: #666;
    margin: 0;
  }

  .link a {
    color: #4CAF50;
    text-decoration: none;
    font-weight: 600;
  }

  .link a:hover {
    text-decoration: underline;
  }
</style>
