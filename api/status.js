module.exports = (req, res) => {
  const cookieHeader = req.headers.cookie || ''
  const authed = cookieHeader.split(';').some((c) => c.trim().startsWith('jj_auth=1'))

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  return res.end(JSON.stringify({ ok: true, authed }))
}
