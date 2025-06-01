<template>
  <div class="register-container">
    <div class="register-card">
      <h1 class="register-title">Create your account</h1>
      <p class="register-subtitle">
        Or <router-link to="/login" class="register-link">sign in to existing account</router-link>
      </p>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name" class="form-label">Name</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            class="form-input"
            placeholder="Full name"
          />
        </div>
        
        <div class="form-group">
          <label for="email" class="form-label">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            class="form-input"
            placeholder="Email address"
          />
        </div>
        
        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            minlength="6"
            class="form-input"
            placeholder="Password (min 6 characters)"
          />
        </div>

        <button
          type="submit"
          class="register-button"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Creating account...' : 'Create account' }}
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
  name: '',
  email: '',
  password: ''
})

const handleRegister = async () => {
  try {
    await authStore.register(form.value)
    router.push('/dashboard')
  } catch (error) {
    // Error handling is done in the store
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 1rem;
}

.register-card {
  width: 100%;
  max-width: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.register-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a2e;
  text-align: center;
  margin-bottom: 0.5rem;
}

.register-subtitle {
  text-align: center;
  color: #6c757d;
  margin-bottom: 2rem;
}

.register-link {
  color: #4361ee;
  font-weight: 500;
  text-decoration: none;
}

.register-link:hover {
  text-decoration: underline;
}

.register-form {
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

.register-button {
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

.register-button:hover {
  background-color: #3f37c9;
}

.register-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>