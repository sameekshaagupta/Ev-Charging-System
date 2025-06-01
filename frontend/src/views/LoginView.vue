<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">Sign in to your account</h1>
      <p class="login-subtitle">
        Or <router-link to="/register" class="login-link">create a new account</router-link>
      </p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email" class="form-label">Email address</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="form-input"
            placeholder="Enter your email"
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            class="form-input"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          class="login-button"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    await authStore.login(form.value)
    router.push('/dashboard')
  } catch (error) {
    // Error handling is done in the store
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.login-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
  text-align: center;
  margin-bottom: 0.5rem;
}

.login-subtitle {
  text-align: center;
  color: #6c757d;
  margin-bottom: 2rem;
}

.login-link {
  color: #4361ee;
  font-weight: 500;
  text-decoration: none;
}

.login-link:hover {
  text-decoration: underline;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1a1a2e;
}

.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
  outline: none;
}

.login-button {
  padding: 0.75rem;
  background-color: #4361ee;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.login-button:hover {
  background-color: #3f37c9;
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>