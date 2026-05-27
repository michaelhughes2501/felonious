function ItemCard({ item, onEdit, onDelete }) {
  return (
    <div style={styles.card}>
      <div>
        <strong>{item.name}</strong>
        {item.description && <p style={styles.desc}>{item.description}</p>}
      </div>
      <div style={styles.actions}>
        <button onClick={() => onEdit(item)} style={styles.editBtn}>Edit</button>
        <button onClick={() => onDelete(item.id)} style={styles.deleteBtn}>Delete</button>
      </div>
    </div>
  )
}

const styles = {
  card: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.75rem 1rem', marginBottom: '0.5rem',
    background: '#1a1a1a', borderRadius: 6, border: '1px solid #333',
  },
  desc: { color: '#aaa', fontSize: '0.85rem', marginTop: '0.2rem' },
  actions: { display: 'flex', gap: '0.5rem' },
  editBtn: { padding: '0.25rem 0.75rem', borderRadius: 4, border: 'none', background: '#2a6', color: '#fff', cursor: 'pointer' },
  deleteBtn: { padding: '0.25rem 0.75rem', borderRadius: 4, border: 'none', background: '#a22', color: '#fff', cursor: 'pointer' },
}

export default ItemCard
