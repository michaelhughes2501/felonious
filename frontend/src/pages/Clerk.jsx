import { useEffect, useState } from 'react'
import assistantService from '../services/assistantService'

const starterMessages = [
  'Help me draft a Kite to my PO about housing.',
  'What events do I need to keep up with today?',
  'Find the right Commissary area for work resources.',
]

function Clerk() {
  const [events, setEvents] = useState([])
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'I am The Clerk. I can help you draft Kites, find Commissary resources, and keep track of Roll Call, Visitation, and other important events.',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    assistantService.getEvents()
      .then(data => setEvents(data.events || []))
      .catch(() => setError('The Clerk could not load important events.'))
  }, [])

  const sendMessage = (text = input) => {
    const trimmed = text.trim()
    if (!trimmed || loading) return

    setError('')
    setInput('')
    setMessages(current => [...current, { role: 'resident', content: trimmed }])
    setLoading(true)

    assistantService.chat(trimmed)
      .then(data => {
        setMessages(current => [...current, { role: 'assistant', content: data.message }])
      })
      .catch(() => setError('The Clerk could not respond. Try again in a moment.'))
      .finally(() => setLoading(false))
  }

  return (
    <div className="page clerk-page">
      <div className="clerk-header">
        <div>
          <h2 className="section-title" style={{ border: 'none', margin: 0 }}>The Clerk</h2>
          <p className="muted">A supervised assistant for Kites, Commissary resources, and important events.</p>
        </div>
      </div>

      <div className="clerk-layout">
        <section className="card chat-panel">
          <div className="chat-log" aria-live="polite">
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={`chat-bubble ${message.role}`}>
                <div className="chat-label">{message.role === 'assistant' ? 'The Clerk' : 'Resident'}</div>
                <p>{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="chat-bubble assistant">
                <div className="chat-label">The Clerk</div>
                <p>Reviewing that now...</p>
              </div>
            )}
          </div>

          {error && <p className="error">{error}</p>}

          <div className="starter-row">
            {starterMessages.map(message => (
              <button key={message} className="filter-btn" type="button" onClick={() => sendMessage(message)}>
                {message}
              </button>
            ))}
          </div>

          <form className="chat-form" onSubmit={(event) => { event.preventDefault(); sendMessage() }}>
            <textarea
              aria-label="Message The Clerk"
              placeholder="Ask for help drafting a Kite, finding a resource, or tracking an event..."
              value={input}
              onChange={event => setInput(event.target.value)}
            />
            <button className="btn btn-primary" type="submit" disabled={loading}>Send</button>
          </form>
        </section>

        <aside className="card event-panel">
          <div className="section-title">Important Events</div>
          {events.map(event => (
            <div key={event.id} className="event-item">
              <div>
                <strong>{event.title}</strong>
                <p className="muted">{event.starts_at}</p>
              </div>
              <p>{event.summary}</p>
              <span className={`priority priority-${event.priority}`}>{event.priority}</span>
            </div>
          ))}
        </aside>
      </div>

      <p className="muted clerk-note">
        The Clerk is logged for safety and supervision. It can support navigation and drafting, but urgent safety concerns should go directly to a supervisor, crisis line, or emergency service.
      </p>
    </div>
  )
}

export default Clerk
