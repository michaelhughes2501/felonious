import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import api from '../api/client'

export default function Profile() {
  const { resident, loading } = useAuth()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    if (!loading && !resident) { navigate('/login'); return }
    if (resident) {
      api.get('/auth/me')
        .then(r => setProfile(r.data.data.resident))
        .catch(() => setErr('Could not load profile.'))
    }
  }, [resident, loading, navigate])

  if (loading || !profile) return <div style={styles.page}><p style={styles.muted}>Loading profile…</p></div>

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>My Cell</h2>
      {err && <p style={styles.err}>{err}</p>}
      <div style={styles.card}>
        <div style={styles.avatar}>{profile.handle?.[0]?.toUpperCase() ?? '?'}</div>
        <h3 style={styles.handle}>{profile.handle}</h3>
        <p style={styles.email}>{profile.email}</p>
        {profile.location && <p style={styles.detail}>📍 {profile.location}</p>}
        {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
        <p style={styles.joined}>Member since {new Date(profile.created_at).toLocaleDateString()}</p>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: '480px', margin: '0 auto', padding: '40px 24px' },
  h2: { fontSize: '24px', fontWeight: '700', margin: '0 0 24px', color: '#1a1a2e' },
  card: { padding: '32px', border: '1px solid #e5e7eb', borderRadius: '10px', background: '#fff', textAlign: 'center' },
  avatar: {
    width: '64px', height: '64px', borderRadius: '50%', background: '#1a1a2e', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '24px', fontWeight: '700', margin: '0 auto 16px',
  },
  handle: { margin: '0 0 4px', fontSize: '20px', fontWeight: '700', color: '#1a1a2e' },
  email: { margin: '0 0 12px', color: '#666', fontSize: '14px' },
  detail: { margin: '0 0 6px', color: '#666', fontSize: '14px' },
  bio: { margin: '10px 0', color: '#555', fontSize: '14px', lineHeight: '1.6' },
  joined: { margin: '12px 0 0', fontSize: '12px', color: '#999' },
  muted: { color: '#888', fontStyle: 'italic' },
  err: { color: '#b91c1c', background: '#fee2e2', padding: '12px 16px', borderRadius: '6px' },
}
