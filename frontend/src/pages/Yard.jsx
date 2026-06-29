import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Yard() {
  const { resident } = useAuth()

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <h1 style={styles.h1}>Welcome to The Yard</h1>
        <p style={styles.sub}>
          {resident
            ? `Good to see you, ${resident.handle}. What do you need today?`
            : 'A supervised community for returning residents. Sign in to get started.'}
        </p>
      </section>

      <section style={styles.grid}>
        <Card to="/commissary" title="Commissary" desc="Housing, employment, wellness, and legal resources." icon="📦" />
        <Card to="/connects" title="Connections" desc="Find approved peer connections in your area." icon="🤝" />
        <Card to="/clerk" title="The Clerk" desc="Draft a Kite, check your schedule, or ask for guidance." icon="💬" />
        {resident && <Card to="/profile" title="My Cell" desc="View and manage your personal profile." icon="🏠" />}
      </section>
    </div>
  )
}

function Card({ to, title, desc, icon }) {
  return (
    <Link to={to} style={styles.card}>
      <div style={styles.icon}>{icon}</div>
      <h3 style={styles.cardTitle}>{title}</h3>
      <p style={styles.cardDesc}>{desc}</p>
    </Link>
  )
}

const styles = {
  page: { maxWidth: '900px', margin: '0 auto', padding: '40px 24px' },
  hero: { textAlign: 'center', marginBottom: '48px' },
  h1: { fontSize: '32px', fontWeight: '700', color: '#1a1a2e', margin: 0 },
  sub: { marginTop: '12px', fontSize: '16px', color: '#555', lineHeight: '1.6' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' },
  card: {
    display: 'block', padding: '28px 24px', background: '#f7f8fa',
    border: '1px solid #e5e7eb', borderRadius: '10px', textDecoration: 'none',
    transition: 'border-color .15s', color: 'inherit',
  },
  icon: { fontSize: '28px', marginBottom: '12px' },
  cardTitle: { margin: '0 0 8px', fontSize: '17px', fontWeight: '600', color: '#1a1a2e' },
  cardDesc: { margin: 0, fontSize: '14px', color: '#555', lineHeight: '1.5' },
}
