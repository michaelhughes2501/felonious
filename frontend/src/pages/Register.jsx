import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/client'

export default function Register() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ handle: '', email: '', password: '' })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    try {
      const r = await api.post('/auth/register', form)
      login(r.data.data.token, r.data.data.resident)
      navigate('/yard')
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrap}>
      <div style={styles.card}>
        <h2 style={styles.h2}>Create Your Account</h2>
        {error && <p style={styles.err}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Handle (display name)</label>
          <input name="handle" value={form.handle} onChange={handleChange} required style={styles.input} />
          <label style={styles.label}>Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} required style={styles.input} />
          <label style={styles.label}>Password</label>
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={8} style={styles.input} />
          <button type="submit" disabled={loading} className="nh-btn-primary" style={styles.btn}>
            {loading ? 'Creating account…' : 'Register'}
          </button>
        </form>
        <p style={styles.foot}>Already have an account? <Link to="/login">Sign in</Link>.</p>
      </div>
    </div>
  )
}

const styles = {
  wrap: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 56px)', padding: '24px' },
  card: { width: '100%', maxWidth: '380px', padding: '32px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#fff' },
  h2: { margin: '0 0 20px', fontSize: '22px', fontWeight: '700', color: '#1a1a2e' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px', color: '#374151' },
  input: { display: 'block', width: '100%', padding: '9px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' },
  btn: { width: '100%', padding: '10px', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  err: { color: '#b91c1c', background: '#fee2e2', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', marginBottom: '16px' },
  foot: { marginTop: '16px', fontSize: '13px', color: '#555', textAlign: 'center' },
}
