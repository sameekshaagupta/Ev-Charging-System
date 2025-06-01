<template>
  <AppLayout>
    <div class="flex flex-col h-full">
      <div class="flex justify-between items-center mb-4">
        <h1 class="text-2xl font-bold">Charging Stations Map</h1>
        <div class="flex gap-4">
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-green-500 rounded-full"></div>
            <span class="text-sm">Active</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span class="text-sm">Maintenance</span>
          </div>
          <div class="flex items-center gap-1">
            <div class="w-3 h-3 bg-red-500 rounded-full"></div>
            <span class="text-sm">Inactive</span>
          </div>
        </div>
      </div>
      
      <div class="card flex-1 p-0 overflow-hidden">
        <div id="map" class="h-full w-full"></div>
        
        <!-- Station Details Modal -->
        <div v-if="selectedStation" class="modal-overlay">
          <div class="modal-content">
            <div class="p-6">
              <div class="flex justify-between items-start mb-4">
                <h3 class="text-xl font-bold">{{ selectedStation.name }}</h3>
                <button @click="selectedStation = null" class="text-gray-500 hover:text-gray-700 text-2xl">
                  &times;
                </button>
              </div>
              
              <div class="space-y-3">
                <div>
                  <span class="font-medium">Status:</span>
                  <span :class="getStatusClass(selectedStation.status)" class="ml-2 px-2 py-1 rounded-full text-xs">
                    {{ selectedStation.status }}
                  </span>
                </div>
                
                <div>
                  <span class="font-medium">Location:</span>
                  <p class="text-gray-700">{{ selectedStation.location.address || 'No address' }}</p>
                  <p class="text-gray-500 text-sm">
                    {{ selectedStation.location.latitude.toFixed(4) }}, 
                    {{ selectedStation.location.longitude.toFixed(4) }}
                  </p>
                </div>
                
                <div>
                  <span class="font-medium">Power Output:</span>
                  <span class="ml-2">{{ selectedStation.powerOutput }} kW</span>
                </div>
                
                <div>
                  <span class="font-medium">Connector Type:</span>
                  <span class="ml-2">{{ selectedStation.connectorType }}</span>
                </div>
                
                <div v-if="selectedStation.amenities?.length">
                  <span class="font-medium">Amenities:</span>
                  <div class="flex flex-wrap gap-2 mt-1">
                    <span 
                      v-for="amenity in selectedStation.amenities" 
                      :key="amenity"
                      class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                    >
                      {{ amenity }}
                    </span>
                  </div>
                </div>
              </div>
              
              <div class="mt-6 flex justify-end">
                <button
                  @click="selectedStation = null"
                  class="btn btn-outline"
                >
                  Close
                </button>
              </div>
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

const getStatusClass = (status) => {
  switch (status) {
    case 'Active': return 'badge badge-success'
    case 'Inactive': return 'badge badge-error'
    case 'Maintenance': return 'badge badge-warning'
    default: return 'badge badge-info'
  }
}

const getMarkerColor = (status) => {
  switch (status) {
    case 'Active': return '#4CAF50' // Green
    case 'Inactive': return '#F44336' // Red
    case 'Maintenance': return '#FFC107' // Yellow
    default: return '#2196F3' // Blue
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
          html: `<div style="background-color: ${getMarkerColor(station.status)}" class="marker-pin"></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 20]
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
#map {
  min-height: 500px;
}
</style>

<style>
/* Leaflet marker styles - moved to global style to ensure they're applied */
.custom-marker {
  display: flex;
  justify-content: center;
  align-items: center;
}

.marker-pin {
  width: 20px;
  height: 20px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  position: relative;
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
</style>