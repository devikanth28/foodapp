import apiClient from './client';

export const authAPI = {
  register: (data) =>
    apiClient.post('/auth/register', data),     // { name, email, password, phone }

  login: (data) =>
    apiClient.post('/auth/login', data),        // { email, password }

  logout: () =>
    apiClient.post('/auth/logout'),

  getMe: () =>
    apiClient.get('/auth/me'),
};