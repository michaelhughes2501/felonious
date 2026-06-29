import { Routes, Route, NavLink } from 'react-router-dom'
import Home from './pages/Home'
import Kits from './pages/Kits'
import Connects from './pages/Connects'
import Clerk from './pages/Clerk'

function App() {
  return (
    <>
      <nav>
        <span className="brand">FELONIOUS</span>
        <NavLink to="/" end>The Yard</NavLink>
        <NavLink to="/kits">Commissary</NavLink>
        <NavLink to="/connects">Cellmates</NavLink>
        <NavLink to="/clerk">The Clerk</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/kits" element={<Kits />} />
        <Route path="/connects" element={<Connects />} />
        <Route path="/clerk" element={<Clerk />} />
      </Routes>
    </>
  )
}

export default App
