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

  res.setHeader(
    'Set-Cookie',
    serializeCookie('jj_auth', '', {
      maxAge: 0,
      path: '/',
      sameSite: 'Lax',
      secure: process.env.NODE_ENV === 'production',
    }),
  )

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify({ ok: true }))
}
