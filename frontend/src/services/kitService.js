import axios from 'axios'

const BASE = '/api/kits'

const kitService = {
  getAll: (category) => axios.get(BASE, { params: category ? { category } : {} }).then(r => r.data),
  getOne: (id) => axios.get(`${BASE}/${id}`).then(r => r.data),
  create: (data) => axios.post(BASE, data).then(r => r.data),
  update: (id, data) => axios.put(`${BASE}/${id}`, data).then(r => r.data),
  remove: (id) => axios.delete(`${BASE}/${id}`).then(r => r.data),
}

export default kitService
