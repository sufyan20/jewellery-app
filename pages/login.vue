<template>
  <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden" style="width: 100%; max-width: 400px;">
      <div class="card-header bg-primary text-white p-4 text-center border-0">
        <h2 class="h4 mb-0 fw-bold">Al Hayat Jewelers App</h2>
        <p class="small mb-0 opacity-75">Sign in to continue</p>
      </div>
      <div class="card-body p-4">
        <div v-if="error" class="alert alert-danger small">{{ error }}</div>
        
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <label class="form-label small fw-bold">Email Address</label>
            <input v-model="form.email" type="email" class="form-control" placeholder="admin@example.com" required>
          </div>
          <div class="mb-4">
            <label class="form-label small fw-bold">Password</label>
            <input v-model="form.password" type="password" class="form-control" placeholder="••••••••" required>
          </div>
          <button type="submit" class="btn btn-primary w-100 py-2 fw-bold" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Sign In
          </button>
        </form>
      </div>
      <div class="card-footer bg-white text-center py-3 border-0">
        <p class="small text-muted mb-0">Don't have an account? Contact administrator.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'blank'
})

const form = ref({
  email: '',
  password: ''
})
const loading = ref(false)
const error = ref(null)

const handleLogin = async () => {
  loading.value = true
  error.value = null
  try {
    // In a real app, this would call /api/auth/login
    // For now, we'll simulate a successful login
    if (form.value.email && form.value.password) {
      setTimeout(() => {
        navigateTo('/calculator/new')
      }, 1000)
    }
  } catch (err) {
    error.value = 'Invalid email or password'
  } finally {
    // loading is handled by navigateTo or timeout
  }
}
</script>
