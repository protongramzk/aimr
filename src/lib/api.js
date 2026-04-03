// src/lib/api.js

const BASE_URL = 'https//aipm-tawny.vercel.app'
export const API_BASE = BASE_URL
// =========================
// 🔑 TOKEN MANAGEMENT
// =========================

// simpan token di localStorage (simple version)
export function setToken(token) {
  localStorage.setItem('token', token)
}

export function getToken() {
  return localStorage.getItem('token')
}

export function setApiKey(key) {
  localStorage.setItem('api_key', key)
}

export function getApiKey() {
  return localStorage.getItem('api_key')
}

export function clearAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('api_key')
}

// =========================
// 🚀 CORE FETCH WRAPPER
// =========================

async function request(path, { method = 'GET', body, auth = false, apiKey = false } = {}) {
  const headers = {
    'Content-Type': 'application/json'
  }

  // inject JWT
  if (auth) {
    const token = getToken()
    if (token) headers['Authorization'] = `Bearer ${token}`
  }

  // inject API key
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

export async function signup({ email, password, username }) {
  return request('/auth/signup', {
    method: 'POST',
    body: { email, password, username }
  })
}

export async function login({ email, password }) {
  const res = await request('/auth/login', {
    method: 'POST',
    body: { email, password }
  })

  // auto save token 🔥
  setToken(res.session.access_token)

  return res
}

export function getMe() {
  return request('/auth/me', { auth: true })
}

// =========================
// 🔑 API KEYS
// =========================

export async function createApiKey(name = 'default') {
  const res = await request('/api-keys/create', {
    method: 'POST',
    auth: true,
    body: { name }
  })

  // simpan langsung biar praktis 😎
  setApiKey(res.key)

  return res
}

export function getApiKeys() {
  return request('/api-keys', { auth: true })
}

export function deleteApiKey(id) {
  return request(`/api-keys/${id}`, {
    method: 'DELETE',
    auth: true
  })
}

// =========================
// 📦 PACKAGES
// =========================

export function fetchPackages({ search = '', limit = 20, offset = 0 } = {}) {
  const params = new URLSearchParams({ search, limit, offset })
  return request(`/packages`)
}

export function getPackage(id) {
  return request(`/packages/${id}`)
}

export function createPackage(data) {
  return request('/packages', {
    method: 'POST',
    apiKey: true,
    body: data
  })
}

export function updatePackage(id, data) {
  return request(`/packages/${id}`, {
    method: 'PATCH',
    apiKey: true,
    body: data
  })
}

export function deletePackage(id) {
  return request(`/packages/${id}`, {
    method: 'DELETE',
    apiKey: true
  })
}

// =========================
// 📦 VERSIONS
// =========================

export function getVersions(packageId) {
  return request(`/packages/${packageId}/versions`)
}

export function createVersion(packageId, version) {
  return request(`/packages/${packageId}/versions`, {
    method: 'POST',
    apiKey: true,
    body: { version }
  })
}

// =========================
// 📂 FILES
// =========================

// NOTE: upload beda karena multipart
export async function uploadFile(packageId, versionId, file) {
  const key = getApiKey()

  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(
    `${BASE_URL}/packages/${packageId}/versions/${versionId}/files`,
    {
      method: 'POST',
      headers: {
        'x-api-key': key
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

export function getFiles(packageId, versionId) {
  return request(`/packages/${packageId}/versions/${versionId}/files`)
}

// =========================
// ⭐ STARS & DOWNLOADS
// =========================

export function starPackage(id) {
  return request(`/packages/${id}/star`, {
    method: 'POST',
    apiKey: true
  })
}

export function unstarPackage(id) {
  return request(`/packages/${id}/star`, {
    method: 'DELETE',
    apiKey: true
  })
}

export function downloadPackage(id) {
  return request(`/packages/${id}/download`, {
    method: 'POST'
  })
}
