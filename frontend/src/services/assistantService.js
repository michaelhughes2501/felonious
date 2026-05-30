import axios from 'axios'

const assistantService = {
  getEvents: (residentId = 'current') =>
    axios.get('/api/assistant/events', { params: { resident_id: residentId } }).then(r => r.data.data),
  chat: (message, residentId = 'current') =>
    axios.post('/api/assistant/chat', { message, resident_id: residentId }).then(r => r.data.data),
}

export default assistantService
