import { useState, useRef, useEffect } from 'react'
import api from '../api/client'

const SUGGESTED = [
  'Draft a Kite to my case manager about housing.',
  'What resources are available for employment?',
  "When is the next Visitation window?",
  'What do I need to do for Roll Call today?',
]

export default function Clerk() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m The Clerk. I can help you draft Kites, find Commissary resources, and track upcoming events like Roll Call and Visitation. What do you need?' }
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text) {
    const msg = (text || input).trim()
    if (!msg) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: msg }])
    setSending(true)
    try {
      const r = await api.post('/assistant/chat', { message: msg })
      setMessages(prev => [...prev, { role: 'assistant', text: r.data.data.message }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: 'I could not process that request. Please try again.' }])
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={styles.page}>
      <h2 style={styles.h2}>The Clerk</h2>
      <p style={styles.sub}>AI-assisted navigation, Kite drafting, and event reminders.</p>
      <p style={styles.disclaimer}>⚠️ The Clerk does not provide legal advice, therapy, or emergency services. All conversations are logged for safety.</p>

      <div style={styles.chat} role="log" aria-live="polite" aria-label="Conversation with The Clerk">
        {messages.map((m, i) => (
          <div key={i} style={{ ...styles.bubble, ...(m.role === 'user' ? styles.user : styles.assistant) }}>
            <p style={styles.bubbleText}>{m.text}</p>
          </div>
        ))}
        {sending && (
          <div style={{ ...styles.bubble, ...styles.assistant }}>
            <p style={{ ...styles.bubbleText, color: '#999' }}>The Clerk is typing…</p>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={styles.suggestions}>
        {SUGGESTED.map((s, i) => (
          <button key={i} style={styles.suggestion} onClick={() => send(s)}>{s}</button>
        ))}
      </div>

      <div style={styles.inputRow}>
        <label htmlFor="clerk-message" style={visuallyHidden}>Message to The Clerk</label>
        <input
          id="clerk-message"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder="Type your message…"
          style={styles.input}
          disabled={sending}
        />
        <button onClick={() => send()} disabled={sending || !input.trim()} className="nh-btn-primary" style={styles.sendBtn}>
          Send
        </button>
      </div>
    </div>
  )
}

const styles = {
  page: { maxWidth: '720px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column' },
  h2: { fontSize: '24px', fontWeight: '700', margin: '0 0 6px', color: '#1a1a2e' },
  sub: { color: '#555', marginBottom: '10px' },
  disclaimer: { fontSize: '12px', color: '#92400e', background: '#fef3c7', padding: '10px 14px', borderRadius: '6px', marginBottom: '20px' },
  chat: { flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '16px', background: '#f9fafb', minHeight: '320px', maxHeight: '480px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' },
  bubble: { maxWidth: '80%', padding: '10px 14px', borderRadius: '10px', lineHeight: '1.5' },
  user: { alignSelf: 'flex-end', background: '#1a1a2e', color: '#fff', borderBottomRightRadius: '2px' },
  assistant: { alignSelf: 'flex-start', background: '#fff', border: '1px solid #e5e7eb', borderBottomLeftRadius: '2px' },
  bubbleText: { margin: 0, fontSize: '14px', whiteSpace: 'pre-wrap' },
  suggestions: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '16px 0 12px' },
  suggestion: { fontSize: '12px', padding: '5px 12px', border: '1px solid #d1d5db', borderRadius: '16px', background: '#fff', cursor: 'pointer', color: '#555' },
  inputRow: { display: 'flex', gap: '8px' },
  input: { flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', outline: 'none' },
  sendBtn: {
    padding: '10px 20px', background: '#1a1a2e', color: '#fff', border: 'none',
    borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '14px',
  },
}

// Visually hidden but still exposed to assistive tech (the input already has
// a placeholder for sighted users, so this label is screen-reader only).
const visuallyHidden = {
  position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px',
  overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0,
}
