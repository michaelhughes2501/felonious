import { useEffect, useState } from 'react'
import connectService from '../services/connectService'

const emptyForm = { handle: '', location: '', released_date: '', bio: '', contact: '' }

function Connects() {
  const [connects, setConnects] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = () =>
    connectService.getAll()
      .then(setConnects)
      .catch(() => setError('Failed to load connects'))

  useEffect(() => { load() }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.handle.trim()) return
    const action = editing
      ? connectService.update(editing.id, form)
      : connectService.create(form)
    action.then(() => {
      setForm(emptyForm); setEditing(null); setShowForm(false); load()
    }).catch(() => setError(editing ? 'Update failed' : 'Post failed'))
  }

  const startEdit = (c) => {
    setEditing(c)
    setForm({
      handle: c.handle, location: c.location || '',
      released_date: c.released_date ? c.released_date.split('T')[0] : '',
      bio: c.bio || '', contact: c.contact || ''
    })
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDelete = (id) =>
    connectService.remove(id).then(load).catch(() => setError('Remove failed'))

  const cancel = () => { setForm(emptyForm); setEditing(null); setShowForm(false) }

  const daysSince = (dateStr) => {
    if (!dateStr) return null
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 86400000)
    if (diff < 1) return 'Today'
    if (diff < 30) return `${diff}d out`
    if (diff < 365) return `${Math.floor(diff / 30)}mo out`
    return `${Math.floor(diff / 365)}yr out`
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ border: 'none', margin: 0 }}>Connects</h2>
        <button className="btn btn-primary" onClick={() => { cancel(); setShowForm(s => !s) }}>
          {showForm && !editing ? 'Cancel' : '+ Post Your Info'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent2)' }}>
          <div className="section-title" style={{ color: 'var(--accent2)' }}>{editing ? 'Update Your Info' : 'Drop Your Info'}</div>
          <p className="muted" style={{ marginBottom: '1rem' }}>Let people in your area know you're out and looking to link up.</p>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-row">
                <input placeholder="Handle / Name *" value={form.handle} onChange={e => setForm(f => ({ ...f, handle: e.target.value }))} required />
                <input placeholder="Location (city, state)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
              <div className="form-row">
                <div>
                  <label className="muted" style={{ fontSize: '0.8rem', marginBottom: '0.3rem', display: 'block' }}>Release date (optional)</label>
                  <input type="date" value={form.released_date} onChange={e => setForm(f => ({ ...f, released_date: e.target.value }))} />
                </div>
                <input placeholder="Contact info (DM, email, etc.)" value={form.contact} onChange={e => setForm(f => ({ ...f, contact: e.target.value }))} />
              </div>
              <textarea placeholder="Bio — what you need, what you're about, what you're looking for" value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Post It'}</button>
                <button type="button" className="btn btn-secondary" onClick={cancel}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      {!showForm && error && <p className="error">{error}</p>}
      {connects.length === 0 && <p className="muted">Nobody posted up yet. Be the first to drop your info.</p>}

      {connects.map(c => (
        <div key={c.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                <strong style={{ fontSize: '1.1rem', color: 'var(--accent2)' }}>{c.handle}</strong>
                {c.location && <span className="muted" style={{ fontSize: '0.85rem' }}>📍 {c.location}</span>}
                {c.released_date && (
                  <span className="tag" style={{ background: '#1a2a1a', color: 'var(--success)' }}>
                    🔓 {daysSince(c.released_date)}
                  </span>
                )}
              </div>
              {c.bio && <p style={{ marginBottom: '0.4rem', lineHeight: 1.5 }}>{c.bio}</p>}
              {c.contact && <p className="muted" style={{ fontSize: '0.85rem' }}>📬 {c.contact}</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => startEdit(c)}>Edit</button>
              <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => handleDelete(c.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Connects
