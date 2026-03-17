import React, { useState } from 'react'
import '../auth.form.scss'
import { useNavigate, Link } from "react-router"
import { useAuth } from '../hooks/useauth'



const Login = () => {
  const { loading, handlelogin } = useAuth()

  const [error, setError] = useState("")

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")

    if (!email || !password) {
      setError("Please provide email and password")
      return
    }

    try {
      await handlelogin({ email, password })
      navigate("/")
    } catch (err) {
      setError(err.message || "Login failed")
    }
  }

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          <div className="auth-loading-wrap">
            <span className="auth-spinner" aria-hidden="true" />
            <p>Signing you in...</p>
          </div>
        </section>
      </main>)
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-brand-panel">
          <p className="auth-kicker">Resume AI</p>
          <h1>Welcome back</h1>
          <p>Jump back into your interview plans and generate tailored strategy reports in minutes.</p>
        </aside>

        <div className="form-container">
          <h2>Login</h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input
                name='email'
                autoComplete='email'
                required
                type="email" id='email' placeholder='Enter email address' />
            </div>

            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                name='password'
                autoComplete='current-password'
                required
                type="password" id='password' placeholder='Enter password' />
            </div>
            <button className='button primary-button auth-submit' disabled={loading}>Login to Dashboard</button>
          </form>
          <p className="switch-copy">Don't have an account? <Link to="/register">Create one</Link></p>
        </div>
      </section>
    </main>
  )
}

export default Login