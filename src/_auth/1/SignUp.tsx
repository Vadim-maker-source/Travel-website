import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SignUp } from '../../lib/appwrite/api'

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    $id: '',
    userId: '',
    name: '',
    email: '',
    password: '',
    number: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      await SignUp(formData)
      navigate('/') // Перенаправление после успешной регистрации
    } catch (err) {
      setError('Ошибка регистрации, ты что, дебил? Данные неправильные!')
      console.error('Registration failed:', err)
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
      <h1>Регистрация для даунов</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Твоё никчемное имя"
          value={formData.name}
          onChange={handleChange}
          required
        />
        
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
          placeholder="Придумай пароль, кретин"
          value={formData.password}
          onChange={handleChange}
          required
        />
        
        <input
          type="text"
          name="number"
          placeholder="Номер телефона (если не дебил)"
          value={formData.number}
          onChange={handleChange}
        />
        
        <button type="submit" disabled={loading}>
          {loading ? 'Идёт регистрация, не дёргайся...' : 'Зарегистрироваться'}
        </button>
      </form>
      
      <p>
        Уже есть аккаунт? 
        <span onClick={() => navigate('/sign-in')}> Войди, дегенерат</span>
      </p>
    </div>
  )
}

export default SignUpPage