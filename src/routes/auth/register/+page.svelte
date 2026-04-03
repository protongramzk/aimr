<script>
  // 1. Import dari $lib/auth.js sesuai pesanan
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

    // Validasi santai
    if (!email || !password || !username) {
      error = 'Waduh, diisi semua dulu dong bosqu!'
      loading = false
      return
    }

    if (password.length < 6) {
      error = 'Password minimal 6 karakter ya, biar aman 🐱‍💻'
      loading = false
      return
    }

    try {
      // 2. Panggil API register baru. Token & Session otomatis kesimpan di auth.js
      const data = await register(email, password, username)

      // Ambil username dari respons (kalau ada) buat disapa
      const greetedName = data?.user?.user_metadata?.username || username
      success = `Mantap! Welcome ${greetedName}! Otw masuk... 🚀`
      
      // Gaskeun ke halaman utama setelah 1 detik
      setTimeout(() => {
        goto('/')
      }, 1000)
    } catch (err) {
      error = err.message || 'Gagal daftar nih, coba lagi ya!'
      console.error('Register error:', err)
    } finally {
      loading = false
    }
  }

  // Biar user bisa tekan Enter buat submit
  function handleKeydown(e) {
    if (e.key === 'Enter' && !loading) {
      handleRegister()
    }
  }
</script>

<div class="register-container">
  <div class="card">
    <h2>Join Skena</h2>
    <p class="subtitle">Bikin akun dulu biar bisa pamer package.</p>

    <div class="form">
      <div class="input-group">
        <input
          bind:value={email}
          type="email"
          placeholder="Email"
          disabled={loading}
          on:keydown={handleKeydown}
        />
      </div>
      
      <div class="input-group">
        <input
          bind:value={username}
          type="text"
          placeholder="Username"
          disabled={loading}
          on:keydown={handleKeydown}
        />
      </div>
      
      <div class="input-group">
        <input
          bind:value={password}
          type="password"
          placeholder="Password (min 6 chars)"
          disabled={loading}
          on:keydown={handleKeydown}
        />
      </div>

      {#if error}
        <div class="alert error-alert">
          <span>⚠️</span> {error}
        </div>
      {/if}

      {#if success}
        <div class="alert success-alert">
          <span>✅</span> {success}
        </div>
      {/if}

      <button on:click={handleRegister} disabled={loading} class="btn-primary">
        {#if loading}
          <span class="spinner"></span> Memproses...
        {:else}
          ✨ Register
        {/if}
      </button>

      <p class="link">
        Udah punya jalur ordal? <a href="/login">Login di sini bang</a>
      </p>
    </div>
  </div>
</div>

<style>
  /* =========================================
     MATERIAL 3 DARK MODE STYLING 
     ========================================= */
  
  /* Reset background body khusus untuk rute ini (opsional kalau belum diset global) */
  :global(body) {
    background-color: #121212; 
    color: #e3e3e3;
    font-family: 'Inter', Roboto, sans-serif;
    margin: 0;
  }

  .register-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    padding: 20px;
    box-sizing: border-box;
  }

  .card {
    background: #1e1e1e; /* M3 Surface Dark */
    border-radius: 24px; /* Sudut melengkung khas M3 */
    padding: 36px 32px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  }

  h2 {
    margin: 0 0 8px 0;
    color: #e3e3e3;
    font-size: 28px;
    font-weight: 600;
    text-align: center;
  }

  .subtitle {
    text-align: center;
    color: #a0a0a0;
    font-size: 15px;
    margin-bottom: 32px;
  }

  .form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .input-group input {
    width: 100%;
    padding: 16px;
    background: #2c2c2c; /* M3 Surface Container Highest */
    border: 1px solid transparent;
    border-radius: 12px;
    font-size: 15px;
    color: #e3e3e3;
    box-sizing: border-box;
    transition: all 0.2s ease;
  }

  .input-group input:focus {
    outline: none;
    border-color: #bb86fc; /* M3 Primary Dark */
    background: #333333;
    box-shadow: 0 0 0 3px rgba(187, 134, 252, 0.15);
  }

  .input-group input::placeholder {
    color: #888;
  }

  .input-group input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .btn-primary {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    padding: 16px;
    background-color: #bb86fc; /* M3 Primary Dark */
    color: #121212; /* M3 On Primary */
    border: none;
    border-radius: 100px; /* Pill shape khas M3 Button */
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 12px;
  }

  .btn-primary:hover:not(:disabled) {
    background-color: #d0bcff;
    transform: translateY(-1px);
  }

  .btn-primary:active:not(:disabled) {
    transform: translateY(0);
  }

  .btn-primary:disabled {
    background-color: #444;
    color: #888;
    cursor: not-allowed;
  }

  .alert {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 14px 16px;
    border-radius: 12px;
    font-size: 14px;
    font-weight: 500;
  }

  .error-alert {
    background-color: rgba(207, 102, 121, 0.1);
    color: #cf6679; /* M3 Error Dark */
    border: 1px solid rgba(207, 102, 121, 0.2);
  }

  .success-alert {
    background-color: rgba(129, 201, 149, 0.1);
    color: #81c995;
    border: 1px solid rgba(129, 201, 149, 0.2);
  }

  .link {
    text-align: center;
    font-size: 14px;
    color: #a0a0a0;
    margin-top: 16px;
  }

  .link a {
    color: #bb86fc;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }

  .link a:hover {
    color: #d0bcff;
    text-decoration: underline;
  }

  /* Animasi Spinner Loading ⏳ */
  .spinner {
    width: 18px;
    height: 18px;
    border: 3px solid rgba(18, 18, 18, 0.3);
    border-top-color: #121212;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
