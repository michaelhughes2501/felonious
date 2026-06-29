<<<<<<< HEAD
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
=======
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Navbar from './components/Navbar'
import Yard from './pages/Yard'
import Commissary from './pages/Commissary'
import Connects from './pages/Connects'
import Clerk from './pages/Clerk'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/yard" replace />} />
            <Route path="/yard" element={<Yard />} />
            <Route path="/commissary" element={<Commissary />} />
            <Route path="/connects" element={<Connects />} />
            <Route path="/clerk" element={<Clerk />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  )
}
>>>>>>> 7998fab135afb5be80f2f8332b690eb90136121a
