import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignIn } from '../../lib/appwrite/api'

const SignInPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await SignIn(formData.email, formData.password)
      navigate('/') // Перенаправление после успешного входа
    } catch (err) {
      setError('Логин/пароль неверные, ты что, слепой?')
      console.error('Login failed:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="auth-container">
      <h1>Вход для дебилов</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          name="email"
          placeholder="Твой кривой email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <input
          type="password"
          name="password"
          placeholder="Твой тупой пароль"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Входим, не мешай...' : 'Войти'}
        </button>
      </form>
      
      <p>
        Нет аккаунта? 
        <span onClick={() => navigate('/sign-up')}> Зарегистрируйся, лузер</span>
      </p>
    </div>
  )
}

export default SignInPage