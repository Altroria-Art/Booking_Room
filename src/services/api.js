// src/services/api.js
import api from '@/plugins/axios'

export const fetchReviews = (params = {}) =>
  api.get('/reviews', { params })       // { page, pageSize, room_id }

export const createReview = (payload) =>
  api.post('/reviews', payload)          // { rating, comment, created_by, room_id? }
