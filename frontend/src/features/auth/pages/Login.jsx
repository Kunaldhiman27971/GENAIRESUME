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
      <main> <div>Loading...</div></main>)
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <p>{error}</p>}
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
          <button className='button primary-button' disabled={loading}>Login</button>
        </form>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </main>
  )
}

export default Login