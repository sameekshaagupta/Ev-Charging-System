<template>
  <div class="app-layout">
    <!-- Mobile Sidebar Toggle -->
    <button 
      @click="isSidebarOpen = !isSidebarOpen"
      class="mobile-menu-button"
    >
      <span class="menu-icon">☰</span>
    </button>

    <!-- Sidebar -->
    <aside 
      class="sidebar"
      :class="{'sidebar-open': isSidebarOpen}"
    >
      <div class="sidebar-header">
        <h1 class="app-title">
          <span class="title-icon">⚡</span>
          EV Charging
        </h1>
      </div>
      <nav class="sidebar-nav">
        <router-link
          v-for="item in navigation"
          :key="item.name"
          :to="item.to"
          class="nav-item"
          :class="{
            'nav-item-active': $route.name === item.name
          }"
          @click="isSidebarOpen = false"
        >
          <component :is="item.icon" class="nav-icon" />
          <span class="nav-label">{{ item.label }}</span>
        </router-link>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="main-content">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h2 class="page-title">{{ pageTitle }}</h2>
          <div class="user-actions">
            <span class="welcome-message">Welcome, {{ authStore.user?.name }}</span>
            <button
              @click="logout"
              class="logout-button"
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Bars3Icon as MenuIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isSidebarOpen = ref(false)

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

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* Mobile Menu Button */
.mobile-menu-button {
  display: none;
  position: fixed;
  top: 1rem;
  left: 1rem;
  z-index: 50;
  padding: 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  cursor: pointer;
}

.menu-icon {
  font-size: 1.25rem;
  color: #1a1a1a;
}

/* Sidebar */
.sidebar {
  width: 240px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: fixed;
  height: 100vh;
  z-index: 40;
  transform: translateX(-100%);
}

.sidebar-open {
  transform: translateX(0);
}

.sidebar-header {
  padding: 1.5rem 1rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
}

.title-icon {
  font-size: 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.sidebar-nav {
  margin-top: 1rem;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: #555;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  position: relative;
}

.nav-item:hover {
  background: rgba(219, 234, 254, 0.5);
  color: #1e40af;
}

.nav-item-active {
  background: rgba(219, 234, 254, 0.7);
  color: #1e40af;
  border-right: 4px solid #1e40af;
}

.nav-icon {
  width: 1.1rem;
  height: 1.1rem;
  margin-right: 0.75rem;
}

.nav-label {
  white-space: nowrap;
}

/* Main Content */
.main-content {
  flex: 1;
  margin-left: 0;
  min-height: 100vh;
  width: 100%;
}

/* Header */
.header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  padding: 1rem 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 1rem;
}

.page-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-message {
  color: #555;
  font-size: 0.9rem;
}

.logout-button {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
  color: #991b1b;
  border: 1px solid #fecaca;
  cursor: pointer;
}

.logout-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
}

/* Page Content */
.page-content {
  padding: 0;
  width: 100%;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .app-layout {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  
  .mobile-menu-button {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .menu-icon {
    color: #f9fafb;
  }
  
  .sidebar {
    background: rgba(31, 41, 55, 0.9);
    border-right-color: rgba(75, 85, 99, 0.3);
  }
  
  .app-title {
    color: #f9fafb;
  }
  
  .nav-item {
    color: #d1d5db;
  }
  
  .nav-item:hover {
    background: rgba(30, 58, 138, 0.3);
    color: #93c5fd;
  }
  
  .nav-item-active {
    background: rgba(30, 58, 138, 0.5);
    color: #93c5fd;
    border-right-color: #3b82f6;
  }
  
  .header {
    background: rgba(31, 41, 55, 0.9);
    border-bottom-color: rgba(75, 85, 99, 0.3);
  }
  
  .page-title {
    color: #f9fafb;
  }
  
  .welcome-message {
    color: #d1d5db;
  }
  
  .logout-button {
    background: linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%);
    color: #fee2e2;
    border-color: #991b1b;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .mobile-menu-button {
    display: block;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .user-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0);
    position: fixed;
    height: 100vh;
  }
  
  .main-content {
    margin-left: 240px;
    width: calc(100% - 240px);
  }
  
  .header {
    padding: 1rem 0;
  }
  
  .header-content {
    padding: 0 1rem;
  }
}
</style>