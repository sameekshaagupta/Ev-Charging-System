import apiService from './apiService'

const chargingStationService = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(
      Object.entries(params).filter(([_, value]) => value !== '' && value != null)
    ).toString()
    
    return await apiService.get(`/charging-stations?${queryString}`)
  },

  getById: async (id) => {
    return await apiService.get(`/charging-stations/${id}`)
  },

  create: async (stationData) => {
    return await apiService.post('/charging-stations', stationData)
  },

  update: async (id, stationData) => {
    return await apiService.put(`/charging-stations/${id}`, stationData)
  },

  delete: async (id) => {
    return await apiService.delete(`/charging-stations/${id}`)
  }
}

export default chargingStationService