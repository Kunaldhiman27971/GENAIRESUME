import React, { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../hooks/useauth"


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
      <main> <div>Loading...</div></main>)
  }

  return (
    <main>
      <div className="form-container">
        <h1>Register</h1>
        <form onSubmit={handleSubmit}>
          {error && <p>{error}</p>}

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

          <button className='button primary-button' disabled={loading}>Register</button>
        </form>
        <p>Already have an account? <Link to="/login">Login</Link></p>
      </div>
    </main>
  )
}

export default Register