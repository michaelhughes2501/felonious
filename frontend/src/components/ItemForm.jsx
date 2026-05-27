import { useState, useEffect } from 'react'

function ItemForm({ onSubmit, initial, onCancel }) {
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')

  useEffect(() => {
    setName(initial?.name || '')
    setDescription(initial?.description || '')
  }, [initial])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({ name, description })
    setName('')
    setDescription('')
  }

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <input
        style={styles.input}
        placeholder="Name *"
        value={name}
        onChange={e => setName(e.target.value)}
        required
      />
      <input
        style={styles.input}
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <div style={styles.buttons}>
        <button type="submit" style={styles.btn}>
          {initial ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{ ...styles.btn, background: '#444' }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}

const styles = {
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' },
  input: { padding: '0.5rem', borderRadius: 4, border: '1px solid #444', background: '#1a1a1a', color: '#fff' },
  buttons: { display: 'flex', gap: '0.5rem' },
  btn: { padding: '0.5rem 1rem', borderRadius: 4, border: 'none', background: '#646cff', color: '#fff', cursor: 'pointer' },
}

export default ItemForm
