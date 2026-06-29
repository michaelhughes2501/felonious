import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <h2 style={{ fontSize: '28px', color: '#1a1a2e' }}>404 — Not Found</h2>
      <p style={{ color: '#666', marginBottom: '24px' }}>This page does not exist.</p>
      <Link to="/" style={{ color: '#3b82d4' }}>Return to The Yard</Link>
    </div>
  )
}
