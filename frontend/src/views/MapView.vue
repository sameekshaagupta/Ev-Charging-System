<template>
  <AppLayout>
    <div class="map-container">
      <!-- Header Section -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-text">
            <h1 class="main-title">
              <span class="title-icon">🗺️</span>
              Charging Stations Map
            </h1>
            <p class="subtitle">Visual overview of your charging network locations</p>
          </div>
          <div class="status-legend">
            <div class="legend-item">
              <div class="legend-dot green"></div>
              <span>Active</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot yellow"></div>
              <span>Maintenance</span>
            </div>
            <div class="legend-item">
              <div class="legend-dot red"></div>
              <span>Inactive</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Card -->
      <div class="map-card">
        <div id="map" class="map-view"></div>
        
        <!-- Station Details Modal -->
        <div v-if="selectedStation" class="modal-overlay">
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">
                <span class="modal-icon">⚡</span>
                {{ selectedStation.name }}
              </h3>
              <button @click="selectedStation = null" class="modal-close">
                &times;
              </button>
            </div>
            
            <div class="modal-body">
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span :class="`status-badge ${selectedStation.status.toLowerCase()}`">
                  {{ selectedStation.status }}
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Location:</span>
                <p class="detail-value">{{ selectedStation.location.address || 'No address available' }}</p>
                <p class="detail-subtext">
                  {{ selectedStation.location.latitude.toFixed(4) }}, 
                  {{ selectedStation.location.longitude.toFixed(4) }}
                </p>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Power Output:</span>
                <span class="detail-value">
                  <span class="power-value">{{ selectedStation.powerOutput }}</span>
                  <span class="power-unit">kW</span>
                </span>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Connector Type:</span>
                <span class="detail-value">{{ selectedStation.connectorType }}</span>
              </div>
              
              <div v-if="selectedStation.amenities?.length" class="detail-row">
                <span class="detail-label">Amenities:</span>
                <div class="amenities-grid">
                  <span 
                    v-for="amenity in selectedStation.amenities" 
                    :key="amenity"
                    class="amenity-badge"
                  >
                    {{ amenity }}
                  </span>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button
                @click="selectedStation = null"
                class="modal-button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import AppLayout from '@/components/AppLayout.vue'
import { useChargingStationsStore } from '@/stores/chargingStations'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const stationsStore = useChargingStationsStore()
const selectedStation = ref(null)
let map = null
let markers = []

const getMarkerColor = (status) => {
  switch (status) {
    case 'Active': return '#10B981' // Green
    case 'Inactive': return '#EF4444' // Red
    case 'Maintenance': return '#F59E0B' // Yellow
    default: return '#3B82F6' // Blue
  }
}

const initMap = () => {
  // Set default view to first station or India if no stations
  const defaultCenter = stationsStore.stations.length > 0
    ? [stationsStore.stations[0].location.latitude, stationsStore.stations[0].location.longitude]
    : [20.5937, 78.9629]
  
  const defaultZoom = stationsStore.stations.length > 0 ? 13 : 5
  
  map = L.map('map').setView(defaultCenter, defaultZoom)
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)
  
  updateMarkers()
}

const updateMarkers = () => {
  // Clear existing markers
  markers.forEach(marker => map.removeLayer(marker))
  markers = []
  
  // Add new markers only for stations with valid coordinates
  stationsStore.stations.forEach(station => {
    if (!station.location?.latitude || !station.location?.longitude) {
      console.warn('Station missing coordinates:', station)
      return
    }
    
    const marker = L.marker(
      [station.location.latitude, station.location.longitude],
      {
        icon: L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="marker-container">
              <div style="background-color: ${getMarkerColor(station.status)}" class="marker-pin"></div>
              <div class="marker-pulse"></div>
            </div>
          `,
          iconSize: [30, 30],
          iconAnchor: [15, 30]
        })
      }
    ).addTo(map)
    
    marker.on('click', () => {
      selectedStation.value = station
    })
    
    markers.push(marker)
  })
  
  // Fit map to show all markers if there are any
  if (markers.length > 0) {
    const group = new L.featureGroup(markers)
    map.fitBounds(group.getBounds().pad(0.2))
  }
}

onMounted(() => {
  initMap()
  
  // If no stations loaded yet, fetch them
  if (stationsStore.stations.length === 0) {
    stationsStore.fetchStations().then(() => {
      updateMarkers()
    })
  }
})

watch(() => stationsStore.stations, (newStations) => {
  if (map) {
    updateMarkers()
    
    // If we have new stations and map hasn't been centered yet
    if (newStations.length > 0 && markers.length === 0) {
      updateMarkers()
    }
  }
}, { deep: true })
</script>

<style scoped>
.map-tooltip {
  position: absolute;
  z-index: 999;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.3);
  padding: 0.75rem 1rem;
  max-width: 250px;
  pointer-events: none;
  transform: translateY(-50%);
  transition: opacity 0.2s, transform 0.2s;
}

.tooltip-header {
  margin-bottom: 0.5rem;
}

.tooltip-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tooltip-icon {
  font-size: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tooltip-body {
  display: grid;
  gap: 0.5rem;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tooltip-label {
  font-size: 0.85rem;
  color: #6b7280;
  font-weight: 500;
}

.tooltip-value {
  font-size: 0.9rem;
  color: #1a1a1a;
  font-weight: 600;
}

/* Dark mode for tooltip */
@media (prefers-color-scheme: dark) {
  .map-tooltip {
    background: rgba(31, 41, 55, 0.95);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .tooltip-title,
  .tooltip-value {
    color: #f9fafb;
  }
  
  .tooltip-label {
    color: #9ca3af;
  }
}
.map-container {
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
  align-items: center;
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
  color: #555;
  font-size: 1.1rem;
  margin: 0;
}

.status-legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #555;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.green {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.legend-dot.yellow {
  background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%);
}

.legend-dot.red {
  background: linear-gradient(135deg, #EF4444 0%, #FCA5A5 100%);
}

/* Map Card */
.map-card {
  height: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #1a1a1a;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #333;
}

.detail-subtext {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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

.power-value {
  font-weight: 700;
  color: #667eea;
}

.power-unit {
  color: #6b7280;
  margin-left: 0.25rem;
}

.amenities-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.amenity-badge {
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .map-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  
  .header-content,
  .map-card,
  .modal-content {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .main-title,
  .modal-title,
  .detail-label {
    color: #f9fafb;
  }
  
  .subtitle,
  .detail-value {
    color: #d1d5db;
  }
  
  .detail-subtext {
    color: #9ca3af;
  }
  
  .modal-header,
  .modal-footer {
    border-color: #374151;
  }
  
  .modal-close {
    color: #9ca3af;
  }
  
  .modal-close:hover {
    color: #f9fafb;
  }
  
  .amenity-badge {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #dbeafe;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .status-legend {
    width: 100%;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .map-card {
    height: 500px;
  }
  
  .main-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 1.75rem;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>

<style>
/* Leaflet marker styles - moved to global style to ensure they're applied */
.custom-marker {
  display: flex;
  justify-content: center;
  align-items: center;
}

.marker-container {
  position: relative;
  width: 30px;
  height: 30px;
}

.marker-pin {
  width: 20px;
  height: 20px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: absolute;
  top: 0;
  left: 5px;
  z-index: 2;
}

.marker-pin::after {
  content: '';
  width: 14px;
  height: 14px;
  margin: 3px 0 0 3px;
  background: white;
  position: absolute;
  border-radius: 50%;
}

.marker-pulse {
  position: absolute;
  width: 30px;
  height: 30px;
  background: inherit;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(0.6);
    opacity: 0;
  }
}
</style>

<style scoped>

.map-container {
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
  align-items: center;
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
  color: #555;
  font-size: 1.1rem;
  margin: 0;
}

.status-legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #555;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.green {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.legend-dot.yellow {
  background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%);
}

.legend-dot.red {
  background: linear-gradient(135deg, #EF4444 0%, #FCA5A5 100%);
}

/* Map Card */
.map-card {
  height: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #1a1a1a;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #333;
}

.detail-subtext {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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

.power-value {
  font-weight: 700;
  color: #667eea;
}

.power-unit {
  color: #6b7280;
  margin-left: 0.25rem;
}

.amenities-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.amenity-badge {
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .map-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  
  .header-content,
  .map-card,
  .modal-content {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .main-title,
  .modal-title,
  .detail-label {
    color: #f9fafb;
  }
  
  .subtitle,
  .detail-value {
    color: #d1d5db;
  }
  
  .detail-subtext {
    color: #9ca3af;
  }
  
  .modal-header,
  .modal-footer {
    border-color: #374151;
  }
  
  .modal-close {
    color: #9ca3af;
  }
  
  .modal-close:hover {
    color: #f9fafb;
  }
  
  .amenity-badge {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #dbeafe;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .status-legend {
    width: 100%;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .map-card {
    height: 500px;
  }
  
  .main-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 1.75rem;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>

<style>
/* Leaflet marker styles - moved to global style to ensure they're applied */
.custom-marker {
  display: flex;
  justify-content: center;
  align-items: center;
}

.marker-container {
  position: relative;
  width: 30px;
  height: 30px;
}

.marker-pin {
  width: 20px;
  height: 20px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: absolute;
  top: 0;
  left: 5px;
  z-index: 2;
}

.marker-pin::after {
  content: '';
  width: 14px;
  height: 14px;
  margin: 3px 0 0 3px;
  background: white;
  position: absolute;
  border-radius: 50%;
}

.marker-pulse {
  position: absolute;
  width: 30px;
  height: 30px;
  background: inherit;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(0.6);
    opacity: 0;
  }
}
</style>

<style scoped>
.map-container {
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
  align-items: center;
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
  color: #555;
  font-size: 1.1rem;
  margin: 0;
}

.status-legend {
  display: flex;
  gap: 1.5rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.95rem;
  color: #555;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-dot.green {
  background: linear-gradient(135deg, #10B981 0%, #34D399 100%);
}

.legend-dot.yellow {
  background: linear-gradient(135deg, #F59E0B 0%, #FCD34D 100%);
}

.legend-dot.red {
  background: linear-gradient(135deg, #EF4444 0%, #FCA5A5 100%);
}

/* Map Card */
.map-card {
  height: 600px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  position: relative;
}

.map-view {
  width: 100%;
  height: 100%;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  width: 90%;
  max-width: 500px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  overflow: hidden;
  animation: modalFadeIn 0.3s ease-out;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.modal-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #6b7280;
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close:hover {
  color: #1a1a1a;
}

.modal-body {
  padding: 1.5rem;
}

.detail-row {
  margin-bottom: 1rem;
}

.detail-label {
  font-weight: 600;
  color: #374151;
  display: block;
  margin-bottom: 0.25rem;
}

.detail-value {
  color: #333;
}

.detail-subtext {
  color: #6b7280;
  font-size: 0.875rem;
  margin-top: 0.25rem;
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

.power-value {
  font-weight: 700;
  color: #667eea;
}

.power-unit {
  color: #6b7280;
  margin-left: 0.25rem;
}

.amenities-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.amenity-badge {
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
  display: flex;
  justify-content: flex-end;
}

.modal-button {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.modal-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .map-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  
  .header-content,
  .map-card,
  .modal-content {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .main-title,
  .modal-title,
  .detail-label {
    color: #f9fafb;
  }
  
  .subtitle,
  .detail-value {
    color: #d1d5db;
  }
  
  .detail-subtext {
    color: #9ca3af;
  }
  
  .modal-header,
  .modal-footer {
    border-color: #374151;
  }
  
  .modal-close {
    color: #9ca3af;
  }
  
  .modal-close:hover {
    color: #f9fafb;
  }
  
  .amenity-badge {
    background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%);
    color: #dbeafe;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .map-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  
  .status-legend {
    width: 100%;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .map-card {
    height: 500px;
  }
  
  .main-title {
    font-size: 2rem;
  }
}

@media (max-width: 480px) {
  .header-content {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 1.75rem;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>

<style>
/* Leaflet marker styles - moved to global style to ensure they're applied */
.custom-marker {
  display: flex;
  justify-content: center;
  align-items: center;
}

.marker-container {
  position: relative;
  width: 30px;
  height: 30px;
}

.marker-pin {
  width: 20px;
  height: 20px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: absolute;
  top: 0;
  left: 5px;
  z-index: 2;
}

.marker-pin::after {
  content: '';
  width: 14px;
  height: 14px;
  margin: 3px 0 0 3px;
  background: white;
  position: absolute;
  border-radius: 50%;
}

.marker-pulse {
  position: absolute;
  width: 30px;
  height: 30px;
  background: inherit;
  border-radius: 50%;
  opacity: 0.6;
  z-index: 1;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.6);
    opacity: 0.6;
  }
  70% {
    transform: scale(1.3);
    opacity: 0;
  }
  100% {
    transform: scale(0.6);
    opacity: 0;
  }
}
</style>