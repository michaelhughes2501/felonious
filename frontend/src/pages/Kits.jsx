import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import kitService from '../services/kitService'

const CATEGORIES = ['all', 'housing', 'jobs', 'mental_health', 'legal', 'general']
const CAT_LABELS = { all: 'All Kits', housing: 'Housing', jobs: 'Jobs', mental_health: 'Mental Health', legal: 'Legal', general: 'General' }

const emptyForm = { title: '', category: 'general', location: '', description: '', url: '' }

function Kits() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [kits, setKits] = useState([])
  const [filter, setFilter] = useState(searchParams.get('category') || 'all')
  const [form, setForm] = useState(emptyForm)
  const [editing, setEditing] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState('')

  const load = (cat) =>
    kitService.getAll(cat === 'all' ? null : cat)
      .then(setKits)
      .catch(() => setError('Failed to pull kits'))

  useEffect(() => { load(filter) }, [filter])

  const setCategory = (cat) => {
    setFilter(cat)
    setSearchParams(cat !== 'all' ? { category: cat } : {})
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    const action = editing
      ? kitService.update(editing.id, form)
      : kitService.create(form)
    action.then(() => {
      setForm(emptyForm); setEditing(null); setShowForm(false); load(filter)
    }).catch(() => setError(editing ? 'Update failed' : 'Drop failed'))
  }

  const startEdit = (kit) => {
    setEditing(kit)
    setForm({ title: kit.title, category: kit.category, location: kit.location || '', description: kit.description || '', url: kit.url || '' })
    setShowForm(true)
    window.scrollTo(0, 0)
  }

  const handleDelete = (id) =>
    kitService.remove(id).then(() => load(filter)).catch(() => setError('Remove failed'))

  const cancel = () => { setForm(emptyForm); setEditing(null); setShowForm(false) }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2 className="section-title" style={{ border: 'none', margin: 0 }}>Resource Kits</h2>
        <button className="btn btn-primary" onClick={() => { cancel(); setShowForm(s => !s) }}>
          {showForm && !editing ? 'Cancel' : '+ Drop a Kit'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '1.5rem', borderColor: 'var(--accent)' }}>
          <div className="section-title">{editing ? 'Update Kit' : 'Drop a New Kit'}</div>
          {error && <p className="error">{error}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <div className="form-row">
                <input placeholder="Kit title *" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                </select>
              </div>
              <input placeholder="Location (city, state)" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              <textarea placeholder="What's in the kit? Who's it for?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              <input placeholder="Link / URL (optional)" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} />
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="btn btn-primary">{editing ? 'Update Kit' : 'Drop It'}</button>
                <button type="button" className="btn btn-secondary" onClick={cancel}>Cancel</button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="filter-bar">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-btn ${filter === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {CAT_LABELS[c]}
          </button>
        ))}
      </div>

      {!showForm && error && <p className="error">{error}</p>}
      {kits.length === 0 && <p className="muted">No kits dropped yet for this category.</p>}

      {kits.map(kit => (
        <div key={kit.id} className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.3rem' }}>
                <strong style={{ fontSize: '1.05rem' }}>{kit.title}</strong>
                <span className={`tag tag-${kit.category}`}>{CAT_LABELS[kit.category]}</span>
                {kit.location && <span className="muted" style={{ fontSize: '0.8rem' }}>📍 {kit.location}</span>}
              </div>
              {kit.description && <p className="muted" style={{ marginBottom: '0.3rem' }}>{kit.description}</p>}
              {kit.url && <a href={kit.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.85rem' }}>🔗 Open Link</a>}
            </div>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => startEdit(kit)}>Edit</button>
              <button className="btn btn-danger" style={{ fontSize: '0.8rem', padding: '0.3rem 0.6rem' }} onClick={() => handleDelete(kit.id)}>Remove</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default Kits
