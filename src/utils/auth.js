export const AUTH_COOKIE_NAME = 'jj_auth'

export function getCookieValue(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie
    .split(';')
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${name}=`))
  if (!match) return null
  return decodeURIComponent(match.split('=').slice(1).join('='))
}

export function isAuthedClient() {
  return getCookieValue(AUTH_COOKIE_NAME) === '1'
}

// Backwards-compatible alias (some components reference this name)
export function hasAuthCookie() {
  return isAuthedClient()
}

export function setAuthCookie(days = 30) {
  if (typeof document === 'undefined') return
  const maxAge = 60 * 60 * 24 * days
  document.cookie = `${AUTH_COOKIE_NAME}=1; path=/; max-age=${maxAge}; samesite=lax`
}

export function clearAuthCookie() {
  if (typeof document === 'undefined') return
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; samesite=lax`
}
