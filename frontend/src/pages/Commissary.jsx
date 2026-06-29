import { useEffect, useState } from 'react'
import api from '../api/client'

const CATEGORIES = ['all', 'housing', 'jobs', 'mental_health', 'legal', 'general']

export default function Commissary() {
  const [kits, setKits] = useState([])
  const [category, setCategory] = useState('all')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    const params = category !== 'all' ? { category } : {}
    api.get('/kits', { params })
      .then(r => setKits(r.data.data?.kits ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [category])

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>Commissary — Resource Center</h2>
      <p style={styles.sub}>Find housing, employment, wellness, and legal resources curated for returning residents.</p>

      <div style={styles.tabs}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)}
            style={{ ...styles.tab, ...(category === c ? styles.tabActive : {}) }}>
            {c === 'all' ? 'All' : c.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading && <p style={styles.muted}>Loading resources…</p>}
      {error && <p style={styles.err}>Could not load resources: {error}</p>}

      <div style={styles.grid}>
        {kits.map(k => (
          <div key={k.id} style={styles.card}>
            <span style={styles.badge}>{k.category}</span>
            <h3 style={styles.title}>{k.title}</h3>
            {k.location && <p style={styles.location}>📍 {k.location}</p>}
            {k.description && <p style={styles.desc}>{k.description}</p>}
            {k.url && k.url !== 'https://example.org' && (
              <a href={k.url} target="_blank" rel="noreferrer" style={styles.link}>Open resource →</a>
            )}
          </div>
        ))}
        {!loading && kits.length === 0 && <p style={styles.muted}>No resources found for this category.</p>}
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
  h2: { fontSize: '24px', fontWeight: '700', margin: '0 0 8px', color: '#1a1a2e' },
  sub: { color: '#555', marginBottom: '24px' },
  tabs: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '28px' },
  tab: { padding: '6px 16px', borderRadius: '20px', border: '1px solid #d1d5db', background: '#fff', cursor: 'pointer', fontSize: '13px' },
  tabActive: { background: '#1a1a2e', color: '#fff', borderColor: '#1a1a2e' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' },
  card: { padding: '20px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#fff' },
  badge: { fontSize: '11px', padding: '2px 8px', background: '#eff6ff', color: '#1d4ed8', borderRadius: '10px', fontWeight: '600' },
  title: { margin: '10px 0 6px', fontSize: '15px', fontWeight: '600', color: '#1a1a2e' },
  location: { margin: '0 0 6px', fontSize: '13px', color: '#666' },
  desc: { margin: '0 0 10px', fontSize: '13px', color: '#555', lineHeight: '1.5' },
  link: { fontSize: '13px', color: '#3b82d4', textDecoration: 'none' },
  muted: { color: '#888', fontStyle: 'italic' },
  err: { color: '#b91c1c', background: '#fee2e2', padding: '12px 16px', borderRadius: '6px' },
}
