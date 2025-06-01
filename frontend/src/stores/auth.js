import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import authService from '@/services/authService'
import { useToast } from 'vue-toastification'

export const useAuthStore = defineStore('auth', () => {
  const toast = useToast()
  const user = ref(null)
  const token = ref(localStorage.getItem('token'))
  const loading = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  const login = async (credentials) => {
    try {
      loading.value = true
      const response = await authService.login(credentials)
      
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)
      
      toast.success('Login successful!')
      return response
    } catch (error) {
      toast.error(error.message || 'Login failed')
      throw error
    } finally {
      loading.value = false
    }
  }

  const register = async (userData) => {
    try {
      loading.value = true
      const response = await authService.register(userData)
      
      user.value = response.user
      token.value = response.token
      localStorage.setItem('token', response.token)
      
      toast.success('Registration successful!')
      return response
    } catch (error) {
      toast.error(error.message || 'Registration failed')
      throw error
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    toast.info('Logged out successfully')
  }

  const fetchProfile = async () => {
    try {
      const response = await authService.getProfile()
      user.value = response.user
    } catch (error) {
      logout()
    }
  }

  if (token.value && !user.value) {
    fetchProfile()
  }

  return {
    user,
    token,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    fetchProfile
  }
})