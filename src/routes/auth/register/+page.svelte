<script>
  import { register } from '$lib/auth.js'
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

    if (!email || !password || !username) {
      error = 'Waduh, diisi semua dulu dong bosqu!'
      loading = false
      return
    }

    if (password.length < 6) {
      error = 'Password minimal 6 karakter ya, biar aman'
      loading = false
      return
    }

    try {
      const data = await register(email, password, username)
      const greetedName = data?.user?.user_metadata?.username || username
      success = `Mantap! Welcome ${greetedName}! Otw masuk...`

      setTimeout(() => goto('/'), 1000)
    } catch (err) {
      error = err.message || 'Gagal daftar nih, coba lagi ya!'
      console.error('Register error:', err)
    } finally {
      loading = false
    }
  }

  function handleKeydown(e) {
    if (e.key === 'Enter' && !loading) handleRegister()
  }
</script>

<div class="container">
  <div class="card">

    <div class="card-header">
      <span class="card-title">Register</span>
    </div>


    <div class="input-group">
      <label class="input-label" for="email">Email</label>
      <input
        id="email"
        class="input-field"
        bind:value={email}
        type="email"
        placeholder="email@domain.com"
        disabled={loading}
        on:keydown={handleKeydown}
      />
    </div>

    <div class="input-group">
      <label class="input-label" for="username">Username</label>
      <input
        id="username"
        class="input-field"
        bind:value={username}
        type="text"
        placeholder="username"
        disabled={loading}
        on:keydown={handleKeydown}
      />
    </div>

    <div class="input-group">
      <label class="input-label" for="password">Password</label>
      <input
        id="password"
        class="input-field"
        bind:value={password}
        type="password"
        placeholder="min. 6 karakter"
        disabled={loading}
        on:keydown={handleKeydown}
      />
    </div>

    {#if error}
      <p class="error">{error}</p>
    {/if}

    {#if success}
      <p class="rank">{success}</p>
    {/if}

    <button
      class="btn btn-primary"
      on:click={handleRegister}
      disabled={loading}
    >
      {#if loading}
        <span class="material-icons spin" style="font-size:16px;margin-right:6px;">autorenew</span>
        Memproses...
      {:else}
        Register
      {/if}
    </button>

    <p class="sub" style="text-align:center;margin-top:8px;">
      Udah punya akun? <a href="/auth/login" class="sub-link" style="display:inline;">Login di sini</a>
    </p>

  </div>
</div>
