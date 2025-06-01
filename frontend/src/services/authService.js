import apiService from './apiService'

const authService = {
  login: async (credentials) => {
    return await apiService.post('/auth/login', credentials)
  },

  register: async (userData) => {
    return await apiService.post('/auth/register', userData)
  },

  getProfile: async () => {
    return await apiService.get('/auth/profile')
  }
}

export default authService