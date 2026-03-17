import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useauth"
import "../auth.form.scss"


const Register = () => {
  const navigate = useNavigate();

  const [error, setError] = useState("")
  const { loading, handleregister } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("")
    const formData = new FormData(e.currentTarget)
    const username = String(formData.get("username") || "").trim()
    const email = String(formData.get("email") || "").trim()
    const password = String(formData.get("password") || "")

    if (!username || !email || !password) {
      setError("Please provide username, email and password")
      return
    }

    try {
      await handleregister({ username, email, password })
      navigate("/")
    } catch (err) {
      setError(err.message || "Registration failed")
    }
  }

  if (loading) {
    return (
      <main className="auth-page">
        <section className="auth-shell">
          <div className="auth-loading-wrap">
            <span className="auth-spinner" aria-hidden="true" />
            <p>Creating your account...</p>
          </div>
        </section>
      </main>)
  }

  return (
    <main className="auth-page">
      <section className="auth-shell">
        <aside className="auth-brand-panel">
          <p className="auth-kicker">Resume AI</p>
          <h1>Build your interview edge</h1>
          <p>Create your account to generate role-specific questions, score fit, and a preparation roadmap.</p>
        </aside>

        <div className="form-container">
          <h2>Register</h2>
          <form onSubmit={handleSubmit}>
            {error && <p className="form-error">{error}</p>}

            <div className="input-group">
              <label htmlFor="username">Username</label>
              <input
                name='username'
                autoComplete='username'
                required
                type="text" id='username' placeholder='Enter username' />
            </div>

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
                autoComplete='new-password'
                required
                type="password" id='password' placeholder='Enter password' />
            </div>

            <button className='button primary-button auth-submit' disabled={loading}>Create Account</button>
          </form>
          <p className="switch-copy">Already have an account? <Link to="/login">Login</Link></p>
        </div>
      </section>
    </main>
  )
}

export default Register