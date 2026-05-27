import { useEffect, useState } from 'react'
import itemService from '../services/itemService'
import ItemForm from '../components/ItemForm'
import ItemCard from '../components/ItemCard'

function Items() {
  const [items, setItems] = useState([])
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')

  const load = () =>
    itemService.getAll()
      .then(setItems)
      .catch(() => setError('Failed to load items'))

  useEffect(() => { load() }, [])

  const handleCreate = (data) =>
    itemService.create(data).then(load).catch(() => setError('Create failed'))

  const handleUpdate = (data) =>
    itemService.update(editing.id, data).then(() => { setEditing(null); load() })
      .catch(() => setError('Update failed'))

  const handleDelete = (id) =>
    itemService.remove(id).then(load).catch(() => setError('Delete failed'))

  return (
    <div style={styles.page}>
      <h2 style={styles.heading}>{editing ? 'Edit Item' : 'Add Item'}</h2>
      <ItemForm
        onSubmit={editing ? handleUpdate : handleCreate}
        initial={editing}
        onCancel={editing ? () => setEditing(null) : undefined}
      />
      {error && <p style={styles.error}>{error}</p>}
      <h2 style={styles.heading}>Items ({items.length})</h2>
      {items.length === 0 && <p style={{ color: '#aaa' }}>No items yet.</p>}
      {items.map(item => (
        <ItemCard key={item.id} item={item} onEdit={setEditing} onDelete={handleDelete} />
      ))}
    </div>
  )
}

const styles = {
  page: { maxWidth: 600, margin: '2rem auto', padding: '0 1rem' },
  heading: { marginBottom: '1rem', borderBottom: '1px solid #333', paddingBottom: '0.5rem' },
  error: { color: '#f66', marginBottom: '1rem' },
}

export default Items
