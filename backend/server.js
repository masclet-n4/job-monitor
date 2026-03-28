import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ── Configuración ────────────────────────────────────────────────────────────
const POCKETBASE_URL = process.env.POCKETBASE_URL      || 'http://localhost:8090'
const PB_EMAIL       = process.env.POCKETBASE_EMAIL    || ''
const PB_PASSWORD    = process.env.POCKETBASE_PASSWORD || ''
const PORT           = parseInt(process.env.PORT || '3000', 10)

// TTL conservador: 6 días (los tokens de PocketBase duran 7 días por defecto)
const TOKEN_TTL_MS = 6 * 24 * 60 * 60 * 1000

// ── Estado del token en memoria ──────────────────────────────────────────────
let authToken      = null
let tokenExpiresAt = 0

// ── Autenticación ────────────────────────────────────────────────────────────
async function authenticate() {
  if (!PB_EMAIL || !PB_PASSWORD) {
    throw new Error('POCKETBASE_EMAIL y/o POCKETBASE_PASSWORD no están definidas')
  }
  console.log(`${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`)


  const res = await fetch(
    `${POCKETBASE_URL}/api/collections/_superusers/auth-with-password`,
    {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ identity: PB_EMAIL, password: PB_PASSWORD }),
    }
  )


  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.message || `HTTP ${res.status} al autenticar con PocketBase`)
  }

  const data = await res.json()
  authToken      = data.token
  tokenExpiresAt = Date.now() + TOKEN_TTL_MS
  console.log('[auth] Autenticación con PocketBase exitosa')
  return authToken
}

async function ensureAuth() {
  if (!authToken || Date.now() >= tokenExpiresAt) {
    console.log('[auth] Token ausente o expirado, re-autenticando…')
    await authenticate()
  }
  return authToken
}

function invalidateToken() {
  authToken      = null
  tokenExpiresAt = 0
}

// ── App Express ──────────────────────────────────────────────────────────────
const app = express()

// ── GET /api/jobs ────────────────────────────────────────────────────────────
app.get('/api/jobs', async (req, res) => {
  try {
    const token = await ensureAuth()

    const { page = '1', perPage = '10', sort = '-start_date', filter = '' } = req.query
    const params = new URLSearchParams({ page, perPage, sort })
    if (filter) params.append('filter', filter)

    const pbRes = await fetch(
      `${POCKETBASE_URL}/api/collections/jobs/records?${params}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (pbRes.status === 401) {
      invalidateToken()
      return res.status(401).json({ error: 'No autorizado — token inválido o expirado' })
    }

    const data = await pbRes.json()
    return res.status(pbRes.status).json(data)
  } catch (err) {
    console.error('[/api/jobs]', err.message)
    return res.status(503).json({ error: 'Servicio no disponible: ' + err.message })
  }
})

// ── GET /api/jobs/:id ────────────────────────────────────────────────────────
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const token = await ensureAuth()

    const pbRes = await fetch(
      `${POCKETBASE_URL}/api/collections/jobs/records/${req.params.id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (pbRes.status === 401) {
      invalidateToken()
      return res.status(401).json({ error: 'No autorizado — token inválido o expirado' })
    }

    const data = await pbRes.json()
    return res.status(pbRes.status).json(data)
  } catch (err) {
    console.error(`[/api/jobs/${req.params.id}]`, err.message)
    return res.status(503).json({ error: 'Servicio no disponible: ' + err.message })
  }
})

// ── Estáticos + SPA fallback ─────────────────────────────────────────────────
const publicDir = path.join(__dirname, 'public')
app.use(express.static(publicDir))
app.get('*', (_req, res) => res.sendFile(path.join(publicDir, 'index.html')))

// ── Arranque ─────────────────────────────────────────────────────────────────
async function start() {
  try {
    await authenticate()
  } catch (err) {
    console.error('[auth] Error al arrancar:', err.message)
    console.warn('[auth] El servidor arrancará igual; /api devolverá 503 hasta reconectar')
  }

  app.listen(PORT, () => {
    console.log(`[server] Escuchando en http://localhost:${PORT}`)
  })
}

start()
