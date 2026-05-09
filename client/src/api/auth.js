import apiClient from './client';

export const authAPI = {
  sendOTP: (phone) =>
    apiClient.post('/auth/send-otp', { phone }),

  verifyOTP: (phone, otp) =>
    apiClient.post('/auth/verify-otp', { phone, otp }),

  refreshToken: (refreshToken) =>
    apiClient.post('/auth/refresh', { refreshToken }),

  logout: () =>
    apiClient.post('/auth/logout'),
};
