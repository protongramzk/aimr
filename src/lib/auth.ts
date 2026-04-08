const BASE_URL = 'https://aipm-tawny.vercel.app'

export interface User {
  id: string;
  username: string;
  email?: string;
  [key: string]: any;
}

interface SessionData {
  access_token?: string;
  refresh_token?: string;
  user?: User;
}

// ─────────────────────────────────────────
// 🔓 JWT DECODE (PURE, NO LIB)
// ─────────────────────────────────────────
function decodeJWT(token: string): any {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch {
    return null
  }
}

/**
 * Checks if the current token is expired or close to expiring
 */
export function isTokenExpired(): boolean {
  const token = localStorage.getItem('aipm_token')
  if (!token) return true

  const decoded = decodeJWT(token)
  if (!decoded || !decoded.exp) return true

  // Buffer of 60 seconds
  const now = Math.floor(Date.now() / 1000)
  return decoded.exp < (now + 60)
}

// ─────────────────────────────────────────
// 💾 STORAGE HELPERS
// ─────────────────────────────────────────
function saveSession({ access_token, refresh_token, user }: SessionData): void {
  if (access_token) {
    localStorage.setItem('aipm_token', access_token)
  }

  if (refresh_token) {
    localStorage.setItem('aipm_refresh', refresh_token)
  }

  if (user) {
    localStorage.setItem('aipm_user', JSON.stringify(user))
    // Important: Store user ID separately
    localStorage.setItem('aipm_user_id', user.id)
  }
}

export function getUserId(): string | null {
  return localStorage.getItem('aipm_user_id')
}

function clearSession(): void {
  localStorage.removeItem('aipm_token')
  localStorage.removeItem('aipm_refresh')
  localStorage.removeItem('aipm_user')
  localStorage.removeItem('aipm_user_id')
}

// ─────────────────────────────────────────
// 🔄 AUTO REFRESH TOKEN
// ─────────────────────────────────────────
let refreshingPromise: Promise<boolean> | null = null;

export async function refreshToken(): Promise<boolean> {
  // If already refreshing, return the same promise to avoid multiple calls
  if (refreshingPromise) return refreshingPromise;

  refreshingPromise = (async () => {
    const refresh_token = localStorage.getItem('aipm_refresh')
    if (!refresh_token) return false

    try {
      const res = await fetch(`${BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token })
      })

      const data = await res.json()

      if (data.access_token && data.refresh_token) {
        localStorage.setItem('aipm_token', data.access_token)
        localStorage.setItem('aipm_refresh', data.refresh_token)
        return true
      }

      return false
    } catch (err: any) {
      console.warn('Refresh token failed:', err.message)
      return false
    } finally {
      refreshingPromise = null;
    }
  })();

  return refreshingPromise;
}

// ─────────────────────────────────────────
// 🌐 BASE REQUEST
// ─────────────────────────────────────────
async function req(method: string, path: string, body?: any, retry = true): Promise<any> {
  // 1. Proactive Refresh
  if (isLoggedIn() && isTokenExpired()) {
    console.log('Token expiring soon, refreshing proactively...')
    await refreshToken()
  }

  let token = localStorage.getItem('aipm_token')

  const headers: Record<string, string> = {
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

  let data: any = {}
  try {
    data = await res.json()
  } catch {}

  if (!res.ok) {
    // 2. Reactive Refresh (401 Unauthorized)
    if (res.status === 401 && retry) {
      console.warn('⚠️ Unauthorized. Attempting reactive refresh...')
      const refreshed = await refreshToken()
      if (refreshed) {
        // Retry the request exactly once
        return req(method, path, body, false)
      }
    }

    throw new Error(data?.error || `HTTP ${res.status}`)
  }

  return data
}

// ─────────────────────────────────────────
// 🔐 LOGIN
// ─────────────────────────────────────────
export async function login(email: string, password: string): Promise<any> {
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
export async function register(email: string, password: string, username: string): Promise<any> {
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
export function logout(): void {
  clearSession()
}

// ─────────────────────────────────────────
// ✅ STATUS
// ─────────────────────────────────────────
export function isLoggedIn(): boolean {
  return !!localStorage.getItem('aipm_token')
}

export function getToken(): string | null {
  return localStorage.getItem('aipm_token')
}

// ─────────────────────────────────────────
// 👤 GET ME (SMART + FALLBACK)
// ─────────────────────────────────────────
export async function getMe(): Promise<User | null> {
  const userId = getUserId()
  const cached = localStorage.getItem('aipm_user')

  if (!userId) {
    return null
  }

  try {
    // We use req instead of direct fetch to benefit from auto-refresh if needed
    // (Though /u/:id doesn't strictly need auth in the API docs, it's safer)
    const data = await req('GET', `/u/${userId}`)

    if (data?.user) {
      localStorage.setItem('aipm_user', JSON.stringify(data.user))
      return data.user
    }
  } catch (err: any) {
    console.warn('getMe error:', err.message)
  }

  // Fallback to cache
  if (cached) {
    return JSON.parse(cached)
  }

  // Minimal identity
  return { id: userId, username: 'Unknown' }
}

// ─────────────────────────────────────────
// 🗝️ API KEYS
// ─────────────────────────────────────────
export async function getApiKeys(): Promise<any> {
  return req('GET', '/api-keys')
}

export async function createApiKey(name = 'default'): Promise<any> {
  return req('POST', '/api-keys', { name })
}

export async function deleteApiKey(id: string): Promise<any> {
  return req('DELETE', `/api-keys/${id}`)
}

export async function renameApiKey(id: string, name: string): Promise<any> {
  return req('PUT', `/api-keys/${id}`, { name })
}

// ─────────────────────────────────────────
// 📦 PACKAGES
// ─────────────────────────────────────────
export async function getPackages({ type = 'feed', username }: { type?: string, username?: string } = {}): Promise<any> {
  const params = new URLSearchParams({ type })

  if (type === 'user' && username) {
    params.append('username', username)
  }

  return req('GET', `/packages?${params.toString()}`)
}

export async function getPackageDetail(name: string): Promise<any> {
  return req('GET', `/mol/${encodeURIComponent(name)}`)
}

export async function getTree(name: string): Promise<any> {
  return req('GET', `/tree/${encodeURIComponent(name)}`)
}

// ─────────────────────────────────────────
// ⭐ STAR
// ─────────────────────────────────────────
export async function toggleStar(pkgname: string): Promise<any> {
  return req('POST', `/star/${encodeURIComponent(pkgname)}`)
}

export async function getStar(pkgname: string): Promise<any> {
  return req('GET', `/star/${encodeURIComponent(pkgname)}`)
}

// ─────────────────────────────────────────
// 🧠 SESSION CHECK
// ─────────────────────────────────────────
export async function getSession(): Promise<any> {
  return req('GET', '/auth/session')
}
