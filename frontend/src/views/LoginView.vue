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
const isLoading = ref(false)

function handleClick(){
  isLoading.value=true
  setTimeout(()=>{
    isLoading.value=false
  }, 5000)
}
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

button{
   padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  margin-top: 0.5rem;
}
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.login-card {
  width: 100%;
  max-width: 450px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 3rem;
}

.login-title {
  font-size: 2rem;
  font-weight: 800;
  color: #1a1a1a;
  text-align: center;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.login-title::before {
  content: "⚡";
  font-size: 2rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.login-subtitle {
  text-align: center;
  color: #6b7280;
  margin-bottom: 2rem;
  font-size: 1.1rem;
}

.login-link {
  color: #667eea;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
}

.login-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.form-label {
  font-size: 0.95rem;
  font-weight: 600;
  color: #374151;
}

.form-input {
  padding: 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus {
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  outline: none;
}

.login-button {
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
  margin-top: 0.5rem;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  background: linear-gradient(135deg, #a3b8ff 0%, #b8a3ff 100%);
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .login-container {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  }
  
  .login-card {
    background: rgba(31, 41, 55, 0.9);
    border-color: rgba(75, 85, 99, 0.3);
  }
  
  .login-title {
    color: #f9fafb;
  }
  
  .login-subtitle {
    color: #9ca3af;
  }
  
  .form-label {
    color: #f9fafb;
  }
  
  .form-input {
    background: #374151;
    border-color: #4b5563;
    color: #f9fafb;
  }
  
  .form-input:focus {
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
  }
  
  ::placeholder {
    color: #9ca3af;
  }
}
</style>