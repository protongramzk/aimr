// src/lib/auth.js

const BASE_URL = 'https://aipm-tawny.vercel.app'

// ─────────────────────────────────────────
// 🔓 JWT DECODE (PURE, TANPA LIB)
// ─────────────────────────────────────────
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}

function getUserIdFromToken(token) {
  const decoded = decodeJWT(token)
  return decoded?.sub || null
}

// ─────────────────────────────────────────
// 💾 STORAGE HELPERS
// ─────────────────────────────────────────
function saveSession({ access_token, refresh_token, user }) {
  // ❌ gak wajib simpan token lagi
  if (access_token) {
    localStorage.setItem('aipm_token', access_token)
  }

  if (refresh_token) {
    localStorage.setItem('aipm_refresh', refresh_token)
  }

  if (user) {
    localStorage.setItem('aipm_user', JSON.stringify(user))

    // 🔥 INI YANG PENTING
    localStorage.setItem('aipm_user_id', user.id)
  }
}
export function getUserId() {
  return localStorage.getItem('aipm_user_id')
}

function clearSession() {
  localStorage.removeItem('aipm_token')
  localStorage.removeItem('aipm_refresh')
  localStorage.removeItem('aipm_user')
  localStorage.removeItem('aipm_user_id')
}

// ─────────────────────────────────────────
// 🌐 BASE REQUEST (ANTI DRAMA)
// ─────────────────────────────────────────
async function req(method, path, body) {
  const token = localStorage.getItem('aipm_token')

  const headers = {
    'Content-Type': 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  let data = {}
  try {
    data = await res.json()
  } catch {}

  if (!res.ok) {
    if (res.status === 401) {
      console.warn('⚠️ Unauthorized (token mungkin invalid)')
      return { error: 'unauthorized' }
    }

    throw new Error(data?.error || `HTTP ${res.status}`)
  }

  return data
}

// ─────────────────────────────────────────
// 🔐 LOGIN
// ─────────────────────────────────────────
export async function login(email, password) {
  const data = await req('POST', '/auth/login', { email, password })

  saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user
  })

  return data
}

// ─────────────────────────────────────────
// 📝 REGISTER
// ─────────────────────────────────────────
export async function register(email, password, username) {
  const data = await req('POST', '/auth/register', {
    email,
    password,
    username
  })

  saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    user: data.user
  })

  return data
}

// ─────────────────────────────────────────
// 🔓 LOGOUT
// ─────────────────────────────────────────
export function logout() {
  clearSession()
}

// ─────────────────────────────────────────
// ✅ STATUS
// ─────────────────────────────────────────
export function isLoggedIn() {
  return !!localStorage.getItem('aipm_token')
}

export function getToken() {
  return localStorage.getItem('aipm_token')
}


// ─────────────────────────────────────────
// 👤 GET ME (SMART + FALLBACK)
// ─────────────────────────────────────────
export async function getMe() {
  const userId = getUserId()
  const cached = localStorage.getItem('aipm_user')

  if (!userId) {
    return null
  }

  try {
    // 🔥 kirim ID langsung, tanpa token
    const res = await fetch(`${BASE_URL}/u/${userId}`)

    const data = await res.json()

    if (data?.user) {
      localStorage.setItem('aipm_user', JSON.stringify(data.user))
      return data.user
    }
  } catch (err) {
    console.warn('getMe error:', err.message)
  }

  // fallback ke cache
  if (cached) {
    return JSON.parse(cached)
  }

  // minimal identity
  return { id: userId }
}

// ─────────────────────────────────────────
// 🗝️ API KEYS
// ─────────────────────────────────────────
export async function getApiKeys() {
  return req('GET', '/api-keys')
}

export async function createApiKey(name = 'default') {
  return req('POST', '/api-keys', { name })
}

export async function deleteApiKey(id) {
  return req('DELETE', `/api-keys/${id}`)
}

export async function renameApiKey(id, name) {
  return req('PUT', `/api-keys/${id}`, { name })
}

// ─────────────────────────────────────────
// 📦 PACKAGES
// ─────────────────────────────────────────
export async function getPackages({ type = 'feed', username } = {}) {
  const params = new URLSearchParams({ type })

  if (type === 'user' && username) {
    params.append('username', username)
  }

  return req('GET', `/packages?${params.toString()}`)
}

export async function getPackageDetail(name) {
  return req('GET', `/mol/${encodeURIComponent(name)}`)
}

export async function getTree(name) {
  return req('GET', `/tree/${encodeURIComponent(name)}`)
}

// ─────────────────────────────────────────
// ⭐ STAR
// ─────────────────────────────────────────
export async function toggleStar(pkgname) {
  return req('POST', `/star/${encodeURIComponent(pkgname)}`)
}

export async function getStar(pkgname) {
  return req('GET', `/star/${encodeURIComponent(pkgname)}`)
}

// ─────────────────────────────────────────
// 🧠 SESSION CHECK
// ─────────────────────────────────────────
export async function getSession() {
  return req('GET', '/auth/session')
}
// 🔄 AUTO REFRESH TOKEN
export async function refreshToken() {
  try {
    // panggil backend
    const res = await fetch(`${BASE_URL}/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: getUserId() }) // optional, tergantung backend
    })

    const data = await res.json()
    
    if (data.access_token && data.refresh_token) {
      // update localStorage biar token selalu fresh
      localStorage.setItem('aipm_token', data.access_token)
      localStorage.setItem('aipm_refresh', data.refresh_token)
      return true
    }

    return false
  } catch (err) {
    console.warn('Refresh token gagal:', err.message)
    return false
  }
}
