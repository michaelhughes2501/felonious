import { Link } from 'react-router-dom'

const resources = [
  { icon: '🏠', label: 'Housing Kits', desc: 'Halfway houses, transitional housing, and shelter connects', to: '/kits?category=housing' },
  { icon: '💼', label: 'Job Kits', desc: 'Employers that hire with a record and ban-the-box companies', to: '/kits?category=jobs' },
  { icon: '🧠', label: 'Mental Health Kits', desc: 'Counseling, crisis lines, and programs for people fresh out', to: '/kits?category=mental_health' },
  { icon: '⚖️', label: 'Legal Kits', desc: 'Expungement help, legal aid, and rights resources', to: '/kits?category=legal' },
]

function Home() {
  return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)', letterSpacing: 2 }}>FELONIOUS</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
          For those fresh out. Link up. Get your kit. Stay up.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {resources.map(r => (
          <Link key={r.label} to={r.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{r.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{r.label}</div>
              <div className="muted">{r.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Link to="/kits" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'var(--accent)', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>Resource Kits</div>
            <div className="muted" style={{ marginTop: '0.4rem' }}>Browse and drop kits for your city</div>
          </div>
        </Link>
        <Link to="/connects" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'var(--accent2)', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent2)' }}>Connects</div>
            <div className="muted" style={{ marginTop: '0.4rem' }}>Link up with people fresh out in your area</div>
          </div>
        </Link>
      </div>

      <div className="card" style={{ marginTop: '2rem', borderColor: '#2a3a2a' }}>
        <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>🆘 Crisis Line</div>
        <p className="muted">
          If you're struggling — SAMHSA National Helpline: <strong style={{ color: 'var(--text)' }}>1-800-662-4357</strong> (free, 24/7, confidential).
          <br />Crisis Text Line: text <strong style={{ color: 'var(--text)' }}>HOME</strong> to <strong style={{ color: 'var(--text)' }}>741741</strong>
        </p>
      </div>
    </div>
  )
}

export default Home
