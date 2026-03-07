import React, {useState } from 'react'
import '../auth.form.scss'
import  {useNavigate, Link} from "react-router"
import { useAuth } from '../hooks/useauth'



const Login = () => {
  const {loading,handlelogin}=useAuth()

  const [email,setEmail]=useState("")
  const [password,setPassword]=useState("")
const navigate=useNavigate();

  const handleSubmit=async(e)=>{
    e.preventDefault()
    handlelogin({email,password})
  }

  if (loading){
    return (
    <main> <div>Loading...</div></main>)
  }

  return (
    <main>
      <div className="form-container">
        <h1>Login</h1>
        <form onSubmit={handleSubmit}> 
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
            onChange={(e)=>{setEmail(e.target.value)}}
             type="email" id='email' placeholder='Enter email address'/>
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
            onChange={(e)=>{setPassword(e.target.value)}}
            type="password" id='password' placeholder='Enter password'/>
          </div>
          <button className='button primary-button' >Login</button>
        </form>
        <p>Don't have an account? <Link to="/register">Register</Link></p>
      </div>
    </main>
  )
}

export default Login