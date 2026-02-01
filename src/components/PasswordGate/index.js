import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { setAuthCookie } from '../../utils/auth'

const Form = styled.form`
  margin-top: 16px;

  .passwordInline {
    display: inline-flex;
    align-items: baseline;
    gap: 8px;
    user-select: none;
  }

  .passwordTrigger {
    cursor: text;
    opacity: 0.95;
  }

  .passwordInput {
    background: transparent;
    border: 0;
    outline: none;
    padding: 0;
    margin: 0;
    color: inherit;
    font: inherit;
    line-height: inherit;
    transform: translateY(-0.02em);
  }

  .passwordArrow {
    background: transparent;
    border: 0;
    padding: 0;
    margin: 0;
    color: inherit;
    font: inherit;
    cursor: pointer;
    opacity: 0.95;
  }

  .passwordInline:focus-within .passwordTrigger,
  .passwordInline:focus-within .passwordArrow {
    opacity: 1;
  }

  .error {
    margin-top: 10px;
    opacity: 0.85;
    font-size: 12px;
  }
`

function PasswordGate({ onSuccess, textColor }) {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const inputId = useMemo(() => 'site-password', [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // CRA env vars must be prefixed with REACT_APP_
    const expected = process.env.REACT_APP_SITE_PASSWORD

    if (!expected) {
      setError('Missing REACT_APP_SITE_PASSWORD in .env.local')
      setLoading(false)
      return
    }

    if (password !== expected) {
      setError('Incorrect password.')
      setLoading(false)
      return
    }

    setAuthCookie(30)
    setLoading(false)

    if (typeof onSuccess === 'function') {
      onSuccess()
    }
  }

  return (
    <Form onSubmit={submit} style={{ color: textColor }} className="border-top">
      <div className="passwordInline">
        <label htmlFor={inputId} className="passwordTrigger">
          Password ↗
        </label>

        <input
          id={inputId}
          type="password"
          className="passwordInput"
          value={password}
          onChange={(e) => {
            const value = e.target.value
            if (value.length <= 24) setPassword(value)
          }}
          autoComplete="current-password"
          maxLength={24}
          // collapse when empty; expand with dots as the user types
          style={{ width: `${Math.max(1, Math.min(password.length, 32))}ch` }}
        />

        <button
          type="submit"
          className="passwordArrow"
          disabled={loading}
          aria-label="Unlock"
          title="Unlock"
        >
          {loading ? '…' : '→'}
        </button>
      </div>

      {error && <div className="error">{error}</div>}
    </Form>
  )
}

export default PasswordGate
