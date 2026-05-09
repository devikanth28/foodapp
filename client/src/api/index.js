import apiClient from './client';

export const orderAPI = {
  create: (orderData) =>
    apiClient.post('/orders', orderData),

  getById: (id) =>
    apiClient.get(`/orders/${id}`),

  getMyOrders: (params = {}) =>
    apiClient.get('/orders/my-orders', { params }),

  cancel: (id, reason) =>
    apiClient.patch(`/orders/${id}/cancel`, { reason }),

  review: (id, reviewData) =>
    apiClient.post(`/orders/${id}/review`, reviewData),
};

export const paymentAPI = {
  createOrder: (amount, orderId) =>
    apiClient.post('/payments/create-order', { amount, orderId }),

  verify: (paymentData) =>
    apiClient.post('/payments/verify', paymentData),
};

export const userAPI = {
  getProfile: () =>
    apiClient.get('/users/profile'),

  updateProfile: (data) =>
    apiClient.put('/users/profile', data),

  getAddresses: () =>
    apiClient.get('/users/addresses'),

  addAddress: (address) =>
    apiClient.post('/users/addresses', address),

  updateAddress: (id, address) =>
    apiClient.put(`/users/addresses/${id}`, address),

  deleteAddress: (id) =>
    apiClient.delete(`/users/addresses/${id}`),

  saveFcmToken: (token) =>
    apiClient.post('/users/fcm-token', { token }),
};
