import apiClient from './client';

export const userAPI = {
  getProfile: () =>
    apiClient.get('/auth/me'),

  updateProfile: (data) =>
    apiClient.put('/users/profile', data),     // Day 6
};