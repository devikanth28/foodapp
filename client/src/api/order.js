import apiClient from './client';

export const orderAPI = {
  place: (data) =>
    apiClient.post('/orders', data),

  getAll: () =>
    apiClient.get('/orders'),

  getById: (id) =>
    apiClient.get(`/orders/${id}`),

  cancel: (id, reason) =>
    apiClient.patch(`/orders/${id}/cancel`, { reason }),

  updateStatus: (id, status) =>
    apiClient.patch(`/orders/${id}/status`, { status }),
};