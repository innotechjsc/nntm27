import { apiUrl } from './config'

const getBase = () => (import.meta.env.DEV ? '/api' : `${apiUrl}/api`)

const handleResponse = async (res) => {
  let json = {}
  try {
    json = await res.json()
  } catch {
    if (!res.ok) throw new Error(res.statusText || `HTTP ${res.status}`)
  }
  if (!res.ok) throw new Error(json?.message || res.statusText || `HTTP ${res.status}`)
  if (json.success === false) throw new Error(json?.message || 'Request failed')
  return json.data
}

const api = (path) => fetch(`${getBase()}${path}`).then(handleResponse)

export const getPublicPlots = (limit = 6) =>
  api(`/public/plots?limit=${limit}`).then((d) => d || [])

export const getPublicStats = () =>
  api('/public/stats').then((d) => d || {})

export const getFeaturedFarms = (limit = 6) =>
  api(`/public/featured-farms?limit=${limit}`).then((d) => d || [])

export const getPublicProducts = (limit = 8) =>
  api(`/public/products?limit=${limit}`).then((d) => d || [])

export const getRegionsSummary = () =>
  api('/public/regions-summary').then((d) => d || { provincesCount: 0, provinces: [] })

