<template>
  <AppLayout>
    <div class="charging-stations-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-text">
            <h1 class="main-title">
              <span class="title-icon">⚡</span>
              Charging Stations
            </h1>
            <p class="subtitle">Manage your electric vehicle charging network</p>
          </div>
          <button @click="openAddForm" class="add-button">
            <span class="button-icon">+</span>
            Add New Station
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filters-header">
          <h3>Filter Stations</h3>
          <span class="filter-count">{{ filteredStations.length }} stations found</span>
        </div>
        <div class="filters-grid">
          <div class="filter-group" v-for="(label, key) in filterLabels" :key="key">
            <label :for="key" class="filter-label">{{ label }}</label>
            <div class="filter-input-wrapper">
              <component
                :is="filterComponents[key]"
                v-model="filters[key]"
                :id="key"
                :min="key.includes('Power') ? 1 : undefined"
                :max="key.includes('Power') ? 350 : undefined"
                @change="applyFilters"
                class="filter-input"
                :type="key.includes('Power') ? 'number' : 'text'"
              >
                <template v-if="key === 'status'">
                  <option value="">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Maintenance">Maintenance</option>
                </template>
                <template v-if="key === 'connectorType'">
                  <option value="">All Types</option>
                  <option value="Type 1">Type 1</option>
                  <option value="Type 2">Type 2</option>
                  <option value="CHAdeMO">CHAdeMO</option>
                  <option value="CCS">CCS</option>
                  <option value="Tesla Supercharger">Tesla Supercharger</option>
                </template>
              </component>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Overlay -->
      <div v-if="showAddForm" class="modal-backdrop" @click.self="closeModal"></div>

      <!-- Centered Modal Form -->
      <teleport to="body">
        <transition name="modal">
          <div v-if="showAddForm" class="station-modal">
            <div class="station-modal-content">
              <div class="station-modal-header">
                <div class="modal-header-content">
                  <h2 class="modal-title">
                    <span class="modal-icon">⚡</span>
                    {{ stationToEdit ? 'Edit' : 'Add New' }} Station
                  </h2>
                  <p class="modal-subtitle">{{ stationToEdit ? 'Update' : 'Create' }} a charging station in your network</p>
                </div>
                <button @click="closeModal" class="close-modal">
                  <span class="close-icon">&times;</span>
                </button>
              </div>
              <div class="station-modal-body">
                <ChargingStationForm 
                  @submit="handleAddStation" 
                  @cancel="closeModal" 
                  :initialData="stationToEdit || defaultStationData"
                  :editMode="!!stationToEdit"
                />
              </div>
            </div>
          </div>
        </transition>
      </teleport>

      <!-- Stations Grid/Table -->
      <div class="stations-container">
        <div class="stations-header">
          <h3>Your Charging Stations</h3>
          <div class="view-controls">
            <button 
              @click="viewMode = 'grid'" 
              :class="['view-btn', { active: viewMode === 'grid' }]"
            >
              ⊞ Grid
            </button>
            <button 
              @click="viewMode = 'table'" 
              :class="['view-btn', { active: viewMode === 'table' }]"
            >
              ☰ Table
            </button>
          </div>
        </div>

        <!-- Grid View -->
        <div v-if="viewMode === 'grid'" class="stations-grid">
          <div 
            v-for="station in paginatedStations" 
            :key="station._id" 
            class="station-card"
            @click="selectStation(station)"
          >
            <div class="station-card-header">
              <div class="station-info">
                <h4 class="station-name">{{ station.name }}</h4>
                <span :class="`status-badge ${station.status.toLowerCase()}`">
                  {{ station.status }}
                </span>
              </div>
              <div class="station-power">
                <span class="power-value">{{ station.powerOutput }}</span>
                <span class="power-unit">kW</span>
              </div>
            </div>
            
            <div class="station-card-body">
              <div class="location-info">
                <div class="address" v-if="station.location?.address">
                  📍 {{ station.location.address }}
                </div>
                <div class="coordinates">
                  🌐 {{ station.location?.latitude?.toFixed(4) }}, {{ station.location?.longitude?.toFixed(4) }}
                </div>
              </div>
              
              <div class="connector-info">
                <span class="connector-label">Connector:</span>
                <span class="connector-type">{{ station.connectorType }}</span>
              </div>
            </div>

            <div class="station-card-actions">
              <button @click.stop="editStation(station)" class="action-btn edit-btn">
                ✏️ Edit
              </button>
              <button @click.stop="confirmDeleteStation(station._id)" class="action-btn delete-btn">
                🗑️ Delete
              </button>
            </div>
          </div>

          <div v-if="filteredStations.length === 0" class="empty-state">
            <div class="empty-icon">⚡</div>
            <h3>No charging stations found</h3>
            <p>Create your first charging station to get started</p>
            <button @click="openAddForm" class="empty-action-btn">
              Add Station
            </button>
          </div>
        </div>

        <!-- Table View -->
        <div v-if="viewMode === 'table'" class="stations-table-container">
          <div class="table-wrapper">
            <table class="stations-table">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Power</th>
                  <th>Connector</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="station in paginatedStations" :key="station._id" class="station-row">
                  <td class="station-cell">
                    <div class="station-name-cell">
                      <span class="station-icon">⚡</span>
                      <span class="station-name">{{ station.name }}</span>
                    </div>
                  </td>
                  <td class="location-cell">
                    <div v-if="station.location?.address" class="address">{{ station.location.address }}</div>
                    <div class="coordinates">
                      {{ station.location?.latitude?.toFixed(4) }}, {{ station.location?.longitude?.toFixed(4) }}
                    </div>
                  </td>
                  <td>
                    <span :class="`status-badge ${station.status.toLowerCase()}`">
                      {{ station.status }}
                    </span>
                  </td>
                  <td class="power-cell">
                    <span class="power-value">{{ station.powerOutput }}</span>
                    <span class="power-unit">kW</span>
                  </td>
                  <td class="connector-cell">{{ station.connectorType }}</td>
                  <td class="actions-cell">
                    <button @click.stop="editStation(station)" class="table-action-btn edit-btn">
                      ✏️
                    </button>
                    <button @click.stop="confirmDeleteStation(station._id)" class="table-action-btn delete-btn">
                      🗑️
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredStations.length === 0">
                  <td colspan="6" class="no-stations">
                    <div class="empty-table-state">
                      <span class="empty-icon">⚡</span>
                      <span>No charging stations found</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Enhanced Pagination -->
      <div class="pagination" v-if="filteredStations.length > 0 && pagination.totalPages > 1">
        <div class="pagination-info">
          <span class="page-text">
            Page <strong>{{ pagination.currentPage }}</strong> of <strong>{{ pagination.totalPages }}</strong>
          </span>
          <span class="results-text">
            ({{ filteredStations.length }} total results)
          </span>
        </div>
        <div class="pagination-controls">
          <button 
            @click="prevPage" 
            :disabled="pagination.currentPage === 1" 
            class="pagination-button prev-btn"
          >
            ← Previous
          </button>
          <div class="page-numbers">
            <button 
              v-for="page in visiblePages" 
              :key="page"
              @click="goToPage(page)"
              :class="['page-number-btn', { active: page === pagination.currentPage }]"
            >
              {{ page }}
            </button>
          </div>
          <button 
            @click="nextPage" 
            :disabled="pagination.currentPage === pagination.totalPages" 
            class="pagination-button next-btn"
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import ChargingStationForm from '@/components/ChargingStationForm.vue'
import { useChargingStationsStore } from '@/stores/chargingStations'
import { useToast } from 'vue-toastification'

const toast = useToast()
const stationsStore = useChargingStationsStore()

const showAddForm = ref(false)
const allStations = ref([])
const stationToEdit = ref(null)
const pagination = ref({ 
  currentPage: 1, 
  totalPages: 1, 
  totalItems: 0,
  itemsPerPage: 10
})
const filters = ref({ 
  status: '', 
  connectorType: '', 
  minPower: '', 
  maxPower: '' 
})
const viewMode = ref('grid')

const defaultStationData = {
  name: '',
  location: {
    latitude: null,
    longitude: null,
    address: ''
  },
  status: 'Active',
  powerOutput: null,
  connectorType: '',
  price: 0,
  amenities: []
}

const filterLabels = {
  status: 'Status',
  connectorType: 'Connector Type',
  minPower: 'Min Power (kW)',
  maxPower: 'Max Power (kW)'
}

const filterComponents = {
  status: 'select',
  connectorType: 'select',
  minPower: 'input',
  maxPower: 'input'
}

// Computed properties
const filteredStations = computed(() => {
  return allStations.value.filter(station => {
    const matchesStatus = !filters.value.status || station.status === filters.value.status
    const matchesConnector = !filters.value.connectorType || station.connectorType === filters.value.connectorType
    const matchesMinPower = !filters.value.minPower || station.powerOutput >= Number(filters.value.minPower)
    const matchesMaxPower = !filters.value.maxPower || station.powerOutput <= Number(filters.value.maxPower)
    
    return matchesStatus && matchesConnector && matchesMinPower && matchesMaxPower
  })
})

const paginatedStations = computed(() => {
  const start = (pagination.value.currentPage - 1) * pagination.value.itemsPerPage
  const end = start + pagination.value.itemsPerPage
  return filteredStations.value.slice(start, end)
})

const visiblePages = computed(() => {
  const current = pagination.value.currentPage
  const total = pagination.value.totalPages
  const pages = []
  
  // Always show first page
  if (current > 3) pages.push(1)
  if (current > 4) pages.push('...')
  
  // Show current page and surrounding pages
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.push(i)
  }
  
  // Always show last page
  if (current < total - 3) pages.push('...')
  if (current < total - 2) pages.push(total)
  
  return pages
})

// Watchers
watch(filteredStations, (newVal) => {
  updatePagination(newVal.length)
})

// Methods
const applyFilters = () => {
  pagination.value.currentPage = 1
}

const fetchStations = async () => {
  try {
    const response = await stationsStore.fetchStations()
    allStations.value = response.chargingStations || []
    updatePagination(allStations.value.length)
  } catch (error) {
    toast.error('Failed to fetch charging stations')
    console.error('Error fetching stations:', error)
  }
}

const updatePagination = (totalItems) => {
  pagination.value.totalItems = totalItems
  pagination.value.totalPages = Math.ceil(totalItems / pagination.value.itemsPerPage)
  
  // Adjust current page if it exceeds total pages
  if (pagination.value.currentPage > pagination.value.totalPages && pagination.value.totalPages > 0) {
    pagination.value.currentPage = pagination.value.totalPages
  }
}

const openAddForm = () => {
  stationToEdit.value = null
  showAddForm.value = true
}

const closeModal = () => {
  showAddForm.value = false
  stationToEdit.value = null
}

const handleAddStation = async (stationData) => {
  try {
    if (stationToEdit.value) {
      await stationsStore.updateStation(stationToEdit.value._id, stationData)
      toast.success('Station updated successfully')
    } else {
      await stationsStore.createStation(stationData)
      toast.success('Station added successfully')
    }
    
    closeModal()
    await fetchStations()
  } catch (error) {
    toast.error(error.message || 'Failed to save station')
  }
}

const selectStation = (station) => {
  // Could be used for detailed view or other actions
  console.log('Station selected:', station)
}

const editStation = (station) => {
  stationToEdit.value = { ...station }
  showAddForm.value = true
}

const confirmDeleteStation = (id) => {
  if (confirm('Are you sure you want to delete this station?')) {
    deleteStation(id)
  }
}

const deleteStation = async (id) => {
  try {
    await stationsStore.deleteStation(id)
    await fetchStations()
    toast.success('Station deleted successfully')
  } catch (error) {
    toast.error('Failed to delete station')
  }
}

const goToPage = (page) => {
  if (page === '...') return
  pagination.value.currentPage = page
}

const nextPage = () => {
  if (pagination.value.currentPage < pagination.value.totalPages) {
    pagination.value.currentPage++
  }
}

const prevPage = () => {
  if (pagination.value.currentPage > 1) {
    pagination.value.currentPage--
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchStations()
})
</script>


<style scoped>
/* Global Styles */
/* Add this at the top of your style section */
.charging-stations-container {
  color: var(--text-color, #1a1a1a); /* Default to dark gray, but can be overridden */
}

@media (prefers-color-scheme: dark) {
  .charging-stations-container {
    --text-color: #f9fafb; /* Light color for dark mode */
  }
}
.charging-stations-container {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.header-text {
  flex: 1;
}

.main-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.title-icon {
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #6b7280;
  font-size: 1.1rem;
  margin: 0;
}

.add-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  font-weight: 600;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.add-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.add-button:active {
  transform: translateY(0);
}

.button-icon {
  font-size: 1.2rem;
  font-weight: bold;
}

/* Filters Section */
.filters-section {
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h3 {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.3rem;
  font-weight: 700;
}

.filter-count {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #374151;
  font-size: 0.9rem;
}

.filter-input-wrapper {
  position: relative;
}

.filter-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.filter-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* Modal Styles */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

.station-modal {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 2rem;
}

.station-modal-content {
  background: white;
  border-radius: 24px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow: hidden;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
/* Add these styles to your existing CSS */
.station-modal-content {
  background: white;
  color: #1a1a1a; /* Ensure default text color is dark */
}

@media (prefers-color-scheme: dark) {
  .station-modal-content {
    background: #1f2937;
    color: #f9fafb; /* Light text for dark mode */
  }
  
  /* Ensure form inputs are visible in dark mode */
  .station-modal-content input,
  .station-modal-content select,
  .station-modal-content textarea {
    background: #374151;
    color: #f9fafb;
    border-color: #4b5563;
  }
  
  .station-modal-content label {
    color: #f9fafb;
  }
  
  /* Make sure placeholders are visible */
  .station-modal-content ::placeholder {
    color: #9ca3af;
    opacity: 1;
  }
  
  /* Style for disabled inputs */
  .station-modal-content input:disabled,
  .station-modal-content select:disabled,
  .station-modal-content textarea:disabled {
    background: #4b5563;
    color: #d1d5db;
  }
}

/* Make sure the modal content has proper contrast in both modes */
.modal-title,
.modal-subtitle {
  color: inherit; /* Inherits from parent which we set above */
}

/* If you're using any specific form component classes, add them here */
.charging-station-form {
  color: inherit;
}

.charging-station-form label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: inherit;
}

.charging-station-form input,
.charging-station-form select,
.charging-station-form textarea {
  width: 100%;
  padding: 0.75rem;
  margin-bottom: 1rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  background: white;
  color: #1a1a1a;
}

@media (prefers-color-scheme: dark) {
  .charging-station-form input,
  .charging-station-form select,
  .charging-station-form textarea {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
}
.station-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header-content {
  flex: 1;
}

.modal-title {
  font-size: 1.8rem;
  font-weight: 700;
  color:rgb(229, 229, 229);
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-icon {
  font-size: 1.5rem;
}

.modal-subtitle {
  color:rgb(167, 167, 167);
  margin: 0;
  font-size: 1rem;
}

.close-modal {
  background: #f3f4f6;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-left: 1rem;
}

.close-modal:hover {
  background: #e5e7eb;
  transform: rotate(90deg);
}

.close-icon {
  font-size: 1.5rem;
  color: #6b7280;
}

.station-modal-body {
  padding: 0 2rem 2rem 2rem;
  max-height: calc(90vh - 150px);
  overflow-y: auto;
}

/* Stations Container */
.stations-container {
  margin-bottom: 2rem;
}

.stations-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;
}

.stations-header h3 {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 700;
}

.view-controls {
  display: flex;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.9);
  padding: 0.25rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.view-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: transparent;
  color: #6b7280;
}

.view-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.view-btn:hover:not(.active) {
  background: #f3f4f6;
  color: #374151;
}

/* Grid View */
.stations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.station-card {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.station-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.station-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.station-info {
  flex: 1;
}

.station-name {
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0 0 0.5rem 0;
}

.station-power {
  text-align: right;
}

.power-value {
  font-size: 2rem;
  font-weight: 800;
  color: #667eea;
}

.power-unit {
  font-size: 0.9rem;
  color: #6b7280;
  margin-left: 0.25rem;
}

.station-card-body {
  margin-bottom: 1.5rem;
}

.location-info {
  margin-bottom: 1rem;
}

.address {
  color: #374151;
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.coordinates {
  color: #6b7280;
  font-size: 0.9rem;
}

.connector-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.connector-label {
  color: #6b7280;
  font-size: 0.9rem;
}

.connector-type {
  font-weight: 600;
  color: #374151;
}

.station-card-actions {
  display: flex;
  gap: 0.75rem;
}

.action-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.edit-btn {
  background: #f0f9ff;
  color: #0284c7;
  border: 1px solid #e0f2fe;
}

.edit-btn:hover {
  background: #e0f2fe;
  transform: translateY(-1px);
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.delete-btn:hover {
  background: #fecaca;
  transform: translateY(-1px);
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.empty-action-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 2rem;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.empty-action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

/* Table View */
.stations-table-container {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.table-wrapper {
  overflow-x: auto;
}

.stations-table {
  width: 100%;
  border-collapse: collapse;
}

.stations-table th {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 1.5rem 1rem;
  text-align: left;
  font-weight: 700;
  color: #374151;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stations-table td {
  padding: 1.5rem 1rem;
  border-bottom: 1px solid #f3f4f6;
}

.station-row {
  transition: all 0.3s ease;
}

.station-row:hover {
  background: #f8fafc;
}

.station-name-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.station-icon {
  font-size: 1.2rem;
}

.station-name {
  font-weight: 600;
  color: #374151;
}

.location-cell .address {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.25rem;
}

.location-cell .coordinates {
  color: #6b7280;
  font-size: 0.85rem;
}

.power-cell {
  text-align: center;
}

.power-cell .power-value {
  font-weight: 700;
  color: #667eea;
  font-size: 1.1rem;
}

.power-cell .power-unit {
  color: #6b7280;
  font-size: 0.9rem;
  margin-left: 0.25rem;
}

.connector-cell {
  font-weight: 500;
  color: #374151;
}

.actions-cell {
  text-align: center;
}

.table-action-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  margin: 0 0.25rem;
  transition: all 0.3s ease;
}

.table-action-btn:hover {
  background: #f3f4f6;
  transform: scale(1.1);
}

.table-action-btn.edit-btn {
  color: #0284c7;
}

.table-action-btn.delete-btn {
  color: #dc2626;
}

.empty-table-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 3rem;
  color: #6b7280;
}

.empty-table-state .empty-icon {
  font-size: 3rem;
  opacity: 0.5;
}

/* Status Badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: capitalize;
  border: 1px solid transparent;
  transition: all 0.3s ease;
}

.status-badge.active {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
  border-color: #a7f3d0;
}

.status-badge.inactive {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border-color: #fecaca;
}

.status-badge.maintenance {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
  border-color: #fde68a;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  gap: 2rem;
}

.pagination-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.page-text {
  font-weight: 600;
  color: #374151;
}

.results-text {
  font-size: 0.9rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.pagination-button {
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #374151;
}

.pagination-button:hover:not(:disabled) {
  background: #f8fafc;
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f9fafb;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  color: #374151;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-number-btn:hover {
  border-color: #667eea;
  color: #667eea;
  transform: translateY(-1px);
}

.page-number-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

/* Transitions */
.modal-overlay-enter-active,
.modal-overlay-leave-active {
  transition: opacity 0.3s ease;
}

.modal-overlay-enter-from,
.modal-overlay-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(20px);
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .charging-stations-container {
    padding: 1.5rem;
  }
  
  .stations-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .charging-stations-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1.5rem;
    padding: 1.5rem;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .stations-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .station-modal {
    padding: 1rem;
    align-items: flex-start;
    padding-top: 2rem;
  }
  
  .station-modal-content {
    max-height: 95vh;
  }
  
  .stations-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .view-controls {
    align-self: flex-end;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .pagination-controls {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .page-numbers {
    order: -1;
  }
  
  .table-wrapper {
    font-size: 0.9rem;
  }
  
  .stations-table th,
  .stations-table td {
    padding: 1rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .charging-stations-container {
    padding: 0.75rem;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 1.75rem;
  }
  
  .add-button {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
  
  .station-card {
    padding: 1rem;
  }
  
  .station-card-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .filters-section {
    padding: 1rem;
  }
  
  .pagination-button {
    padding: 0.5rem 1rem;
    font-size: 0.9rem;
  }
  
  .page-numbers {
    gap: 0.25rem;
  }
  
  .page-number-btn {
    width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .charging-stations-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  
  .header-content,
  .filters-section,
  .station-card,
  .stations-table-container,
  .pagination {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .main-title,
  .station-name,
  .filters-header h3,
  .stations-header h3 {
    color: #f9fafb;
  }
  
  .subtitle,
  .coordinates,
  .connector-label {
    color: #9ca3af;
  }
  
  .filter-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .station-modal-content {
    background: #1f2937;
  }
  
  .stations-table th {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    color: #f9fafb;
  }
}
</style>