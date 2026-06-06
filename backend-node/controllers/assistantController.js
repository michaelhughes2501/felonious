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
    starts_at: 'Tuesdays and Thursdays, 6:00 PM - 8:00 PM',
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

function buildAssistantReply(message) {
  const normalized = message.toLowerCase()

  if (normalized.includes('kite') || normalized.includes('draft') || normalized.includes('message')) {
    return buildKiteDraft(message)
  }

  if (normalized.includes('event') || normalized.includes('today') || normalized.includes('schedule') || normalized.includes('keep up')) {
    return `Here are the key items to keep on your radar: ${eventSchedule.map((event) => `${event.title} (${event.starts_at})`).join('; ')}.`
  }

  const resourceKey = detectResource(message)
  if (resourceKey) return resourceMap[resourceKey]

  if (normalized.includes('crisis') || normalized.includes('hurt myself') || normalized.includes('unsafe')) {
    return 'If there is immediate danger, contact emergency services or your supervisor now. You can also call or text 988 for crisis support in the United States. I can help find the right platform resource, but I cannot provide therapy or emergency intervention.'
  }

  return 'I can help you find Commissary resources, prepare a Kite, track Roll Call and Visitation items, or understand what to do next. Tell me what you are trying to handle.'
}

const assistantController = {
  async getEvents(req, res) {
    const residentId = req.body?.resident_id || 'current'

    res.json({
      success: true,
      data: {
        resident_id: residentId,
        events: eventSchedule,
      },
      meta: {
        request_id: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
      error: null,
    })
  },

  async chat(req, res) {
    const { message = '', resident_id = 'current' } = req.body

    if (!message.trim()) {
      return res.status(400).json({
        success: false,
        data: null,
        meta: {
          request_id: `req_${Date.now()}`,
          timestamp: new Date().toISOString(),
          version: 'v1',
        },
        error: {
          code: 'ASSISTANT_MESSAGE_REQUIRED',
          message: 'The Clerk needs a message before it can help.',
        },
      })
    }

    res.json({
      success: true,
      data: {
        resident_id,
        assistant_name: 'The Clerk',
        message: buildAssistantReply(message),
        safety_note: 'The Clerk supports navigation, reminders, and supervised communication drafting. It does not replace a PO, clinician, or emergency service.',
      },
      meta: {
        request_id: `req_${Date.now()}`,
        timestamp: new Date().toISOString(),
        version: 'v1',
      },
      error: null,
    })
  },
}

module.exports = assistantController
