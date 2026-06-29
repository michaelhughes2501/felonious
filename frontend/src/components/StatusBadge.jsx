export default function StatusBadge({ success }) {
  return (
    <span style={{
      display: 'inline-block', fontSize: '11px', padding: '2px 8px', borderRadius: '10px',
      background: success ? '#d1fae5' : '#fee2e2',
      color: success ? '#065f46' : '#991b1b',
      fontWeight: '600',
    }}>
      {success ? 'OK' : 'ERROR'}
    </span>
  )
}
