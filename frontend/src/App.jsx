import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Kits from './pages/Kits'
import Connects from './pages/Connects'

function App() {
  return (
    <>
      <nav>
        <span className="brand">FELONIOUS</span>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/kits">Kits</NavLink>
        <NavLink to="/connects">Connects</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kits" element={<Kits />} />
        <Route path="/connects" element={<Connects />} />
      </Routes>
    </>
  )
}

export default App
