import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { resident, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>Felonious</Link>
      <div style={styles.links}>
        <NavLink to="/yard" style={navStyle}>The Yard</NavLink>
        <NavLink to="/commissary" style={navStyle}>Commissary</NavLink>
        <NavLink to="/connects" style={navStyle}>Connections</NavLink>
        <NavLink to="/clerk" style={navStyle}>The Clerk</NavLink>
        {resident ? (
          <>
            <NavLink to="/profile" style={navStyle}>My Cell</NavLink>
            <button onClick={handleLogout} style={styles.btn}>Sign Out</button>
          </>
        ) : (
          <>
            <NavLink to="/login" style={navStyle}>Sign In</NavLink>
            <NavLink to="/register" style={navStyle}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  )
}

const navStyle = ({ isActive }) => ({
  ...styles.link,
  fontWeight: isActive ? '600' : '400',
  borderBottom: isActive ? '2px solid #3b82d4' : '2px solid transparent',
})

const styles = {
  nav: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', height: '56px', background: '#1a1a2e', color: '#fff',
    position: 'sticky', top: 0, zIndex: 100, boxShadow: '0 1px 4px rgba(0,0,0,.4)',
  },
  brand: { color: '#fff', textDecoration: 'none', fontSize: '18px', fontWeight: '700', letterSpacing: '1px' },
  links: { display: 'flex', alignItems: 'center', gap: '16px' },
  link: { color: '#cdd', textDecoration: 'none', fontSize: '14px', paddingBottom: '2px' },
  btn: {
    background: 'transparent', border: '1px solid #aac', color: '#cdd',
    padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
  },
}
