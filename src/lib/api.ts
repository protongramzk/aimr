const BASE_URL = 'https://aipm-tawny.vercel.app'
export const API_BASE = BASE_URL

// =========================
// 🔑 TOKEN MANAGEMENT
// =========================

/**
 * Stores the JWT token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token)
}

/**
 * Retrieves the JWT token from localStorage
 */
export function getToken(): string | null {
  return localStorage.getItem('token')
}

/**
 * Stores the API key in localStorage
 */
export function setApiKey(key: string): void {
  localStorage.setItem('api_key', key)
}

/**
 * Retrieves the API key from localStorage
 */
export function getApiKey(): string | null {
  return localStorage.getItem('api_key')
}

/**
 * Clears all authentication data from localStorage
 */
export function clearAuth(): void {
  localStorage.removeItem('token')
  localStorage.removeItem('api_key')
}

// =========================
// 🚀 CORE FETCH WRAPPER
// =========================

interface RequestOptions {
  method?: string;
  body?: any;
  auth?: boolean;
  apiKey?: boolean;
}

async function request(path: string, { method = 'GET', body, auth = false, apiKey = false }: RequestOptions = {}): Promise<any> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Inject JWT
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  // Inject API key
  if (apiKey) {
    const key = getApiKey()
    if (key) headers['x-api-key'] = key
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await res.json()

  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Request failed')
  }

  return data
}

// =========================
// 🔐 AUTH
// =========================

export async function signup(data: any): Promise<any> {
  return request('/auth/signup', {
    method: 'POST',
    body: data
  })
}

export async function login(data: any): Promise<any> {
  const res = await request('/auth/login', {
    method: 'POST',
    body: data
  })

  // Auto save token
  if (res.session?.access_token) {
    setToken(res.session.access_token)
  }

  return res
}

export function getMe(): Promise<any> {
  return request('/auth/me', { auth: true })
}

// =========================
// 🔑 API KEYS
// =========================

export async function createApiKey(name = 'default'): Promise<any> {
  const res = await request('/api-keys/create', {
    method: 'POST',
    auth: true,
    body: { name }
  })

  // Save directly for convenience
  if (res.key) {
    setApiKey(res.key)
  }

  return res
}

export function getApiKeys(): Promise<any> {
  return request('/api-keys', { auth: true })
}

export function deleteApiKey(id: string): Promise<any> {
  return request(`/api-keys/${id}`, {
    method: 'DELETE',
    auth: true
  })
}

// =========================
// 📦 PACKAGES
// =========================

export function fetchPackages({ search = '', limit = 20, offset = 0 } = {}): Promise<any> {
  const params = new URLSearchParams({ search, limit: limit.toString(), offset: offset.toString() })
  return request(`/packages?${params.toString()}`)
}

export function getPackage(id: string): Promise<any> {
  return request(`/packages/${id}`)
}

export function createPackage(data: any): Promise<any> {
  return request('/packages', {
    method: 'POST',
    apiKey: true,
    body: data
  })
}

export function updatePackage(id: string, data: any): Promise<any> {
  return request(`/packages/${id}`, {
    method: 'PATCH',
    apiKey: true,
    body: data
  })
}

export function deletePackage(id: string): Promise<any> {
  return request(`/packages/${id}`, {
    method: 'DELETE',
    apiKey: true
  })
}

// =========================
// 📦 VERSIONS
// =========================

export function getVersions(packageId: string): Promise<any> {
  return request(`/packages/${packageId}/versions`)
}

export function createVersion(packageId: string, version: string): Promise<any> {
  return request(`/packages/${packageId}/versions`, {
    method: 'POST',
    apiKey: true,
    body: { version }
  })
}

// =========================
// 📂 FILES
// =========================

// Multipart upload requires different handling
export async function uploadFile(packageId: string, versionId: string, file: File): Promise<any> {
  const key = getApiKey()

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    `${BASE_URL}/packages/${packageId}/versions/${versionId}/files`,
    {
      method: 'POST',
      headers: {
        'x-api-key': key || ''
      },
      body: formData
    }
  )

  const data = await res.json()

  if (!res.ok || data.success === false) {
    throw new Error(data.error || 'Upload failed')
  }

  return data
}

export function getFiles(packageId: string, versionId: string): Promise<any> {
  return request(`/packages/${packageId}/versions/${versionId}/files`)
}

// =========================
// ⭐ STARS & DOWNLOADS
// =========================

export function starPackage(id: string): Promise<any> {
  return request(`/packages/${id}/star`, {
    method: 'POST',
    apiKey: true
  })
}

export function unstarPackage(id: string): Promise<any> {
  return request(`/packages/${id}/star`, {
    method: 'DELETE',
    apiKey: true
  })
}

export function downloadPackage(id: string): Promise<any> {
  return request(`/packages/${id}/download`, {
    method: 'POST'
  })
}
