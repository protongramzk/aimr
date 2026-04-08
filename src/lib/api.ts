import { getToken as getAuthToken, refreshToken, isLoggedIn, isTokenExpired } from './auth';

const BASE_URL = 'https://aipm-tawny.vercel.app'
export const API_BASE = BASE_URL

// =========================
// 🔑 TOKEN MANAGEMENT
// =========================

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

// =========================
// 🚀 CORE FETCH WRAPPER
// =========================

interface RequestOptions {
  method?: string;
  body?: any;
  auth?: boolean;
  apiKey?: boolean;
}

async function request(path: string, { method = 'GET', body, auth = false, apiKey = false }: RequestOptions = {}, retry = true): Promise<any> {
  // Proactive Refresh for Auth
  if (auth && isLoggedIn() && isTokenExpired()) {
    await refreshToken()
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  // Inject JWT
  if (auth) {
    const token = getAuthToken()
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

  let data: any = {}
  try {
    data = await res.json()
  } catch {}

  if (!res.ok || data.success === false) {
    // Reactive Refresh for Auth (401 Unauthorized)
    if (res.status === 401 && auth && retry) {
      const refreshed = await refreshToken()
      if (refreshed) {
        return request(path, { method, body, auth, apiKey }, false)
      }
    }
    throw new Error(data.error || `Request failed with status ${res.status}`)
  }

  return data
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
