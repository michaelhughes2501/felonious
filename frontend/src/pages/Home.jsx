import { Link } from 'react-router-dom'

const resources = [
  { label: 'Housing', desc: 'Transitional housing, shelters, and stable placement resources', to: '/kits?category=housing' },
  { label: 'Work Detail', desc: 'Employment resources, vocational programs, and second-chance hiring leads', to: '/kits?category=jobs' },
  { label: 'Rec Yard', desc: 'Wellness, counseling, peer support, and crisis resources', to: '/kits?category=mental_health' },
  { label: 'Law Library', desc: 'Legal aid, record relief, documentation, and rights resources', to: '/kits?category=legal' },
]

function Home() {
  return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: '3rem 0 2rem' }}>
        <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)', letterSpacing: 2 }}>FELONIOUS</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
          The Yard is a supervised community hub for Residents rebuilding connection, resources, and daily momentum.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
        {resources.map(r => (
          <Link key={r.label} to={r.to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ fontWeight: 700, marginBottom: '0.3rem' }}>{r.label}</div>
              <div className="muted">{r.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <Link to="/kits" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'var(--accent)', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent)' }}>Commissary</div>
            <div className="muted" style={{ marginTop: '0.4rem' }}>Browse and save reentry resources by need and location</div>
          </div>
        </Link>
        <Link to="/connects" style={{ textDecoration: 'none' }}>
          <div className="card" style={{ borderColor: 'var(--accent2)', textAlign: 'center', padding: '1.5rem' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--accent2)' }}>Cellmates</div>
            <div className="muted" style={{ marginTop: '0.4rem' }}>Find peer connections with clear expectations and oversight</div>
          </div>
        </Link>
      </div>

      <Link to="/clerk" style={{ textDecoration: 'none' }}>
        <div className="card" style={{ marginTop: '1rem', borderColor: 'var(--accent)', padding: '1.5rem' }}>
          <div style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--accent)' }}>The Clerk</div>
          <div className="muted" style={{ marginTop: '0.4rem' }}>
            Get help drafting Kites, finding Commissary resources, and keeping up with Roll Call or Visitation.
          </div>
        </div>
      </Link>

      <div className="card" style={{ marginTop: '2rem', borderColor: '#2a3a2a' }}>
        <div style={{ fontWeight: 700, color: 'var(--success)', marginBottom: '0.5rem' }}>Immediate Support</div>
        <p className="muted">
          If you need support now, SAMHSA National Helpline: <strong style={{ color: 'var(--text)' }}>1-800-662-4357</strong> (free, 24/7, confidential).
          <br />Crisis Text Line: text <strong style={{ color: 'var(--text)' }}>HOME</strong> to <strong style={{ color: 'var(--text)' }}>741741</strong>
        </p>
      </div>
    </div>
  )
}

export default Home
