import apiClient from './client';

export const restaurantAPI = {
  // Get nearby restaurants — pass user's lat/lng from browser geolocation
  getNearby: (lat, lng, params = {}) =>
    apiClient.get('/restaurants', { params: { lat, lng, ...params } }),

  getById: (id) =>
    apiClient.get(`/restaurants/${id}`),

  getMenu: (id) =>
    apiClient.get(`/restaurants/${id}/menu`),

  search: (query, params = {}) =>
    apiClient.get('/restaurants/search', { params: { q: query, ...params } }),
};
