function serializeCookie(name, value, options = {}) {
  const enc = encodeURIComponent
  let cookie = `${name}=${enc(value)}`

  if (options.maxAge != null) cookie += `; Max-Age=${options.maxAge}`
  if (options.domain) cookie += `; Domain=${options.domain}`
  if (options.path) cookie += `; Path=${options.path}`
  if (options.expires) cookie += `; Expires=${options.expires.toUTCString()}`
  if (options.httpOnly) cookie += `; HttpOnly`
  if (options.secure) cookie += `; Secure`
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`

  return cookie
}

module.exports = (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ ok: false, error: 'Method Not Allowed' }))
  }

  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })

  req.on('end', () => {
    let password = ''
    try {
      const parsed = JSON.parse(body || '{}')
      password = String(parsed.password || '')
    } catch (e) {
      password = ''
    }

    const expected = process.env.SITE_PASSWORD
    if (!expected) {
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ok: false, error: 'SITE_PASSWORD not set' }))
    }

    if (password !== expected) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      return res.end(JSON.stringify({ ok: false }))
    }

    // 30 days
    const maxAge = 60 * 60 * 24 * 30

    // Note: this cookie is intentionally readable by JS so the UI can gate content.
    // This is a portfolio gate (not high-security auth).
    res.setHeader(
      'Set-Cookie',
      serializeCookie('jj_auth', '1', {
        maxAge,
        path: '/',
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
      }),
    )

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ ok: true }))
  })
}
