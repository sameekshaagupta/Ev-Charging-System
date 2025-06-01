import { defineStore } from 'pinia'
import { ref } from 'vue'
import chargingStationService from '@/services/chargingStationService'
import { useToast } from 'vue-toastification'

export const useChargingStationsStore = defineStore('chargingStations', () => {
  const toast = useToast()
  const stations = ref([])
  const loading = ref(false)
  const filters = ref({
    status: '',
    connectorType: '',
    minPower: '',
    maxPower: ''
  })
  const pagination = ref(null)

  const fetchStations = async (params = {}) => {
    try {
      loading.value = true
      const response = await chargingStationService.getAll({
        ...filters.value,
        ...params
      })
      stations.value = response.chargingStations
      pagination.value = response.pagination
      return response
    } catch (error) {
      toast.error('Failed to fetch charging stations')
      throw error
    } finally {
      loading.value = false
    }
  }

  const createStation = async (stationData) => {
    try {
      loading.value = true
      const response = await chargingStationService.create(stationData)
      stations.value.unshift(response.chargingStation)
      toast.success('Charging station created successfully!')
      return response.chargingStation
    } catch (error) {
      toast.error(error.message || 'Failed to create charging station')
      throw error
    } finally {
      loading.value = false
    }
  }

  const updateStation = async (id, stationData) => {
    try {
      loading.value = true
      const response = await chargingStationService.update(id, stationData)
      const index = stations.value.findIndex(s => s._id === id)
      if (index !== -1) {
        stations.value[index] = response.chargingStation
      }
      toast.success('Charging station updated successfully!')
      return response.chargingStation
    } catch (error) {
      toast.error(error.message || 'Failed to update charging station')
      throw error
    } finally {
      loading.value = false
    }
  }

  const deleteStation = async (id) => {
    try {
      loading.value = true
      await chargingStationService.delete(id)
      stations.value = stations.value.filter(s => s._id !== id)
      toast.success('Charging station deleted successfully!')
    } catch (error) {
      toast.error(error.message || 'Failed to delete charging station')
      throw error
    } finally {
      loading.value = false
    }
  }

  const setFilters = (newFilters) => {
    filters.value = { ...filters.value, ...newFilters }
  }

  const clearFilters = () => {
    filters.value = {
      status: '',
      connectorType: '',
      minPower: '',
      maxPower: ''
    }
  }

  return {
    stations,
    loading,
    filters,
    pagination,
    fetchStations,
    createStation,
    updateStation,
    deleteStation,
    setFilters,
    clearFilters
  }
})