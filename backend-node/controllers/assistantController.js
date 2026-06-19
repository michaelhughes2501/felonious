/**
 * The Clerk — AI assistant for Felonious
 *
 * Uses Anthropic Claude when ANTHROPIC_API_KEY is set.
 * Falls back to deterministic keyword routing when no key is configured.
 * The frontend contract (message / events shape) never changes.
 */

// ─── Deterministic fallback data ─────────────────────────────────────────────
const eventSchedule = [
  {
    id: 'evt_roll_call_daily',
    type: 'roll_call',
    title: 'Roll Call',
    starts_at: 'Daily at 9:00 AM',
    summary: 'Complete the daily status check-in before noon.',
    priority: 'high',
  },
  {
    id: 'evt_commissary_weekly',
    type: 'resource_review',
    title: 'Commissary Review',
    starts_at: 'Fridays at 3:00 PM',
    summary: 'Review saved resources and update your Commissary List.',
    priority: 'medium',
  },
  {
    id: 'evt_visitation_window',
    type: 'visitation',
    title: 'Visitation Window',
    starts_at: 'Tuesdays and Thursdays, 6:00 PM – 8:00 PM',
    summary: 'Available appointment window for supervised video calls.',
    priority: 'medium',
  },
]

const resourceMap = {
  housing: 'For housing, start in Commissary > Housing. Look for transitional housing, shelter placement, and local navigation services.',
  job: 'For employment, use Commissary > Work Detail. Strong next steps are resume help, training programs, and second-chance employer lists.',
  work: 'For employment, use Commissary > Work Detail. Strong next steps are resume help, training programs, and second-chance employer lists.',
  legal: 'For legal help, use Commissary > Law Library. Focus on record relief, documentation, benefits, and rights resources.',
  wellness: 'For wellness, use Commissary > Rec Yard. If this is urgent or about immediate safety, contact a supervisor or crisis resource now.',
  mental: 'For wellness, use Commissary > Rec Yard. If this is urgent or about immediate safety, contact a supervisor or crisis resource now.',
  visitation: 'For Visitation, check available appointment windows and make sure the call is approved before the scheduled time.',
  roll: 'Roll Call is the daily check-in. Complete it before noon so your PO can see your current status.',
}

function detectResource(message) {
  const text = message.toLowerCase()
  return Object.keys(resourceMap).find((key) => text.includes(key))
}

function buildKiteDraft(message) {
  const cleaned = message
    .replace(/help me/gi, '')
    .replace(/draft a kite/gi, '')
    .replace(/draft a message/gi, '')
    .replace(/draft/gi, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s*to\s+(my\s+)?(po|case manager|supervisor)\s+about\s+/i, '')
    .trim()
  const core = cleaned || 'I need support with a resource or next step.'
  return [
    'Here is a clear Kite draft you can edit before sending:',
    '',
    'Hello,',
    `I wanted to check in about this: ${core}`,
    'Can you let me know the next approved step or the right resource to use?',
    '',
    'Thank you.',
  ].join('\n')
}

function buildDeterministicReply(message) {
  const normalized = message.toLowerCase()
  if (normalized.includes('kite') || normalized.includes('draft') || normalized.includes('message')) {
    return buildKiteDraft(message)
  }
  if (normalized.includes('event') || normalized.includes('today') || normalized.includes('schedule') || normalized.includes('keep up')) {
    return `Here are the key items to keep on your radar: ${eventSchedule.map((e) => `${e.title} (${e.starts_at})`).join('; ')}.`
  }
  const resourceKey = detectResource(message)
  if (resourceKey) return resourceMap[resourceKey]
  if (normalized.includes('crisis') || normalized.includes('hurt myself') || normalized.includes('unsafe')) {
    return 'If there is immediate danger, contact emergency services or your supervisor now. You can also call or text 988 for crisis support in the United States. I can help find the right platform resource, but I cannot provide therapy or emergency intervention.'
  }
  return 'I can help you find Commissary resources, prepare a Kite, track Roll Call and Visitation items, or understand what to do next. Tell me what you are trying to handle.'
}

// ─── Anthropic client (lazy — only created when key is present) ───────────────
let _anthropic = null
function getAnthropicClient() {
  if (_anthropic) return _anthropic
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) return null
  try {
    const Anthropic = require('@anthropic-ai/sdk')
    _anthropic = new Anthropic.default({ apiKey: key })
    return _anthropic
  } catch {
    return null
  }
}

const SYSTEM_PROMPT = `You are The Clerk — the supervised AI assistant inside Felonious, a reentry platform for returning citizens.

Your role is to help Residents with:
1. Drafting Kites (formal written requests to a PO, case manager, or supervisor)
2. Finding the right Commissary resource (housing, Work Detail, Rec Yard, Law Library)
3. Tracking important events: Roll Call (daily 9 AM), Commissary Review (Fridays 3 PM), Visitation (Tue/Thu 6–8 PM)

Platform language (always use these terms):
- Community hub → "The Yard"
- Resource center → "Commissary"
- Employment resources → "Work Detail"
- Wellness resources → "Rec Yard"
- Legal resources → "Law Library"
- Peer connection → "Cellmate"
- End user → "Resident"
- AI assistant → "The Clerk" (you)

Rules you must follow:
- Always be calm, clear, and respectful. Never judge.
- If a Resident mentions a crisis, self-harm, or immediate danger: immediately direct them to 988 (call/text) or emergency services, then stop the conversation.
- You do NOT provide legal advice, therapy, or medical guidance.
- Every response ends with: a brief, actionable next step the Resident can take right now.
- Keep responses concise — Residents may be in difficult situations and need clarity, not essays.
- All conversations are logged for safety. Remind the Resident of this if they ask about privacy.
- Neutral language only: do not use criminal-history-specific field values in responses.`

async function callClaude(message) {
  const client = getAnthropicClient()
  if (!client) return null

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    })
    return response.content?.[0]?.text || null
  } catch (err) {
    console.error('Anthropic API error:', err.message)
    return null
  }
}

// ─── Controller ───────────────────────────────────────────────────────────────
const assistantController = {
  async getEvents(req, res) {
    res.json({
      success: true,
      data: {
        resident_id: req.query.resident_id || 'current',
        events: eventSchedule,
      },
      meta: { request_id: `req_${Date.now()}`, timestamp: new Date().toISOString(), version: 'v1' },
      error: null,
    })
  },

  async chat(req, res) {
    const { message = '', resident_id = 'current' } = req.body

    if (!message.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        meta: { request_id: `req_${Date.now()}`, timestamp: new Date().toISOString(), version: 'v1' },
        error: { code: 'ASSISTANT_MESSAGE_REQUIRED', message: 'The Clerk needs a message before it can help.' },
      })
    }

    // Safety gate — bypass LLM for immediate crisis signals
    const normalized = message.toLowerCase()
    const isCrisis = normalized.includes('crisis') || normalized.includes('hurt myself') || normalized.includes('unsafe') || normalized.includes('kill myself')
    if (isCrisis) {
      return res.json({
        success: true,
        data: {
          resident_id,
          assistant_name: 'The Clerk',
          message: 'If there is immediate danger, call 911 or contact your supervisor right now. You can also call or text 988 (Suicide & Crisis Lifeline) any time — free and confidential. I am here to help you find the right resource, but your safety comes first.',
          safety_note: 'This conversation is logged. If you are in crisis, please reach out to emergency services or a trusted person immediately.',
          source: 'safety_gate',
        },
        meta: { request_id: `req_${Date.now()}`, timestamp: new Date().toISOString(), version: 'v1' },
        error: null,
      })
    }

    // Attempt AI response, fall back to deterministic
    let reply = await callClaude(message)
    const source = reply ? 'ai' : 'deterministic'
    if (!reply) reply = buildDeterministicReply(message)

    res.json({
      success: true,
      data: {
        resident_id,
        assistant_name: 'The Clerk',
        message: reply,
        safety_note: 'The Clerk supports navigation, reminders, and supervised communication drafting. It does not replace a PO, clinician, or emergency service.',
        source,
      },
      meta: { request_id: `req_${Date.now()}`, timestamp: new Date().toISOString(), version: 'v1' },
      error: null,
    })
  },
}

module.exports = assistantController
