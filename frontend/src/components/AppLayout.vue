<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="p-6">
        <h1 class="text-2xl font-bold" style="color: var(--primary-color)">EV Charging</h1>
      </div>
      <nav class="mt-6">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="flex items-center px-6 py-3 text-gray-600 hover:bg-blue-50 hover:text-primary-color transition-colors"
          :style="{ 
            'background-color': $route.name === item.name ? 'var(--primary-light)' : '',
            'color': $route.name === item.name ? 'var(--primary-color)' : '',
            'border-right': $route.name === item.name ? '3px solid var(--primary-color)' : ''
          }"
        >
          <component :is="item.icon" class="w-5 h-5 mr-3" />
          {{ item.label }}
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">{{ pageTitle }}</h2>
          <div class="flex items-center gap-4">
            <span class="text-gray-600">Welcome, {{ authStore.user?.name }}</span>
            <button
              @click="logout"
              class="btn btn-outline"
              style="color: var(--danger-color); border-color: var(--danger-color)"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="page-content">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navigation = [
  { name: 'Dashboard', label: 'Dashboard', to: '/dashboard', icon: 'HomeIcon' },
  { name: 'ChargingStations', label: 'Charging Stations', to: '/charging-stations', icon: 'BatteryIcon' },
  { name: 'MapView', label: 'Map View', to: '/map', icon: 'MapIcon' }
]

const pageTitle = computed(() => {
  const currentRoute = navigation.find(item => item.name === route.name)
  return currentRoute?.label || 'Dashboard'
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}
</script>