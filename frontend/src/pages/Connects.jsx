import { useEffect, useState } from 'react'
import api from '../api/client'

export default function Connects() {
  const [connects, setConnects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    api.get('/connects')
      .then(r => setConnects(r.data.data?.connects ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Connections</h2>
      <p style={styles.sub}>Approved peer profiles available for supervised contact and support.</p>

      {loading && <p style={styles.muted}>Loading connections…</p>}
      {error && <p style={styles.err}>Could not load connections: {error}</p>}

      <div style={styles.grid}>
        {connects.map(c => (
          <div key={c.id} style={styles.card}>
            <div style={styles.avatar}>{c.handle?.[0]?.toUpperCase() ?? '?'}</div>
            <h3 style={styles.handle}>{c.handle}</h3>
            {c.location && <p style={styles.location}>📍 {c.location}</p>}
            {c.bio && <p style={styles.bio}>{c.bio}</p>}
            {c.contact && (
              <p style={styles.contact}>
                <strong>Contact:</strong> {c.contact}
              </p>
            )}
          </div>
        ))}
        {!loading && connects.length === 0 && <p style={styles.muted}>No approved connections found.</p>}
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
  h2: { fontSize: '24px', fontWeight: '700', margin: '0 0 8px', color: '#1a1a2e' },
  sub: { color: '#555', marginBottom: '28px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' },
  card: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff', textAlign: 'center' },
  avatar: {
    width: '52px', height: '52px', borderRadius: '50%', background: '#1a1a2e', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '20px', fontWeight: '700', margin: '0 auto 12px',
  },
  handle: { margin: '0 0 6px', fontSize: '16px', fontWeight: '600', color: '#1a1a2e' },
  location: { margin: '0 0 8px', fontSize: '13px', color: '#666' },
  bio: { margin: '0 0 10px', fontSize: '13px', color: '#555', lineHeight: '1.5' },
  contact: { margin: 0, fontSize: '12px', color: '#666' },
  muted: { color: '#888', fontStyle: 'italic' },
  err: { color: '#b91c1c', background: '#fee2e2', padding: '12px 16px', borderRadius: '6px' },
}
