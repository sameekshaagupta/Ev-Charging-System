<template>
  <AppLayout>
    <div class="dashboard-container">
      <!-- Header -->
      <div class="header-section">
        <div class="header-content">
          <div class="header-text">
            <h1 class="main-title">
              <span class="title-icon">📊</span>
              Dashboard Overview
            </h1>
            <p class="subtitle">Key metrics and recent activity for your charging network</p>
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon green">
            <span class="stat-icon-inner">⚡</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Total Stations</p>
            <p class="stat-value">{{ stats.total }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon blue">
            <span class="stat-icon-inner">✅</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Active Stations</p>
            <p class="stat-value">{{ stats.active }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon yellow">
            <span class="stat-icon-inner">🛠️</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Maintenance</p>
            <p class="stat-value">{{ stats.maintenance }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon red">
            <span class="stat-icon-inner">⛔</span>
          </div>
          <div class="stat-content">
            <p class="stat-label">Inactive</p>
            <p class="stat-value">{{ stats.inactive }}</p>
          </div>
        </div>
      </div>

      <!-- Recent Stations -->
      <div class="recent-stations-section">
        <div class="section-header">
          <h3>Recent Charging Stations</h3>
          <span class="count-badge">{{ recentStations.length }} stations</span>
        </div>
        <div class="table-container">
          <table class="stations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Power Output</th>
                <th>Connector Type</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="station in recentStations" :key="station._id">
                <td class="station-name">{{ station.name }}</td>
                <td>
                  <span :class="`status-badge ${station.status.toLowerCase()}`">
                    {{ station.status }}
                  </span>
                </td>
                <td>
                  <span class="power-value">{{ station.powerOutput }}</span>
                  <span class="power-unit">kW</span>
                </td>
                <td>{{ station.connectorType }}</td>
                <td>{{ formatDate(station.createdAt) }}</td>
              </tr>
              <tr v-if="recentStations.length === 0">
                <td colspan="5" class="empty-table">
                  <div class="empty-icon">⚡</div>
                  <p>No recent stations found</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import AppLayout from '@/components/AppLayout.vue'
import { useChargingStationsStore } from '@/stores/chargingStations'

// Pinia store
const stationsStore = useChargingStationsStore()
const { stations } = storeToRefs(stationsStore)

// Compute statistics
const stats = computed(() => ({
  total: stations.value.length,
  active: stations.value.filter(s => s.status === 'Active').length,
  maintenance: stations.value.filter(s => s.status === 'Maintenance').length,
  inactive: stations.value.filter(s => s.status === 'Inactive').length
}))

// Get 5 most recent stations
const recentStations = computed(() => {
  return [...stations.value]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5)
})

// Format date
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Load stations
onMounted(async () => {
  await stationsStore.fetchStations({ limit: 10 })
})
</script>

<style scoped>
.dashboard-container {
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
  color: #555;
  font-size: 1.1rem;
  margin: 0;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
}

.stat-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.green {
  background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%);
  color: #065f46;
}

.stat-icon.blue {
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  color: #1e40af;
}

.stat-icon.yellow {
  background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
  color: #92400e;
}

.stat-icon.red {
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
}

.stat-icon-inner {
  font-size: 1.5rem;
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.95rem;
  color: #555;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

/* Recent Stations Section */
.recent-stations-section {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
}

.section-header h3 {
  margin: 0;
  color: #1a1a1a;
  font-size: 1.5rem;
  font-weight: 700;
}

.count-badge {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 600;
}

.table-container {
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
  color: #333;
}

.station-name {
  font-weight: 600;
  color: #374151;
}

.power-value {
  font-weight: 700;
  color: #667eea;
}

.power-unit {
  color: #6b7280;
  margin-left: 0.25rem;
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

.empty-table {
  text-align: center;
  padding: 3rem;
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.5;
  margin-bottom: 1rem;
  display: block;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .dashboard-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  
  .header-content,
  .stat-card,
  .recent-stations-section {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .main-title,
  .stat-value,
  .section-header h3,
  .station-name {
    color: #f9fafb;
  }
  
  .subtitle,
  .stat-label {
    color: #d1d5db;
  }
  
  .stations-table th {
    background: linear-gradient(135deg, #374151 0%, #4b5563 100%);
    color: #f9fafb;
  }
  
  .stations-table td {
    color: #f9fafb;
    border-bottom-color: #374151;
  }
  
  .power-value {
    color: #818cf8;
  }
  
  .power-unit {
    color: #9ca3af;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .dashboard-container {
    padding: 1rem;
  }
  
  .header-content {
    padding: 1.5rem;
  }
  
  .main-title {
    font-size: 2rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .section-header {
    padding: 1rem;
  }
  
  .stations-table th,
  .stations-table td {
    padding: 1rem 0.75rem;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .main-title {
    font-size: 1.75rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
}
</style>