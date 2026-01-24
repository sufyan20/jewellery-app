<template>
  <div :class="['min-vh-100', isDarkMode ? 'bg-dark text-white' : 'bg-light']">
    <nav :class="['navbar navbar-expand-lg border-bottom py-3', isDarkMode ? 'navbar-dark bg-dark border-secondary' : 'navbar-dark bg-primary shadow-sm border-0']">
      <div class="container">
        <NuxtLink class="navbar-brand fw-bold d-flex align-items-center" to="/">
          <img src="/logo.png" alt="Logo" class="me-2" style="height: 30px;">
        </NuxtLink>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto align-items-center">
            <li class="nav-item">
              <NuxtLink class="nav-link" to="/calculator/new" active-class="active">Calculator</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link" to="/history" active-class="active">History</NuxtLink>
            </li>
            <li class="nav-item">
              <NuxtLink class="nav-link" to="/gatepass" active-class="active">Gate Pass</NuxtLink>
            </li>
            <li class="nav-item ms-lg-3">
              <button @click="toggleDarkMode" class="btn btn-outline-light btn-sm rounded-pill px-3 mt-1 mt-lg-0">
                {{ isDarkMode ? '🌙' : '☀️' }} {{ isDarkMode ? 'Dark' : 'Light' }}
              </button>
            </li>
            <li class="nav-item ms-lg-2">
              <NuxtLink class="btn btn-danger btn-sm rounded-pill px-3 mt-1 mt-lg-0" to="/login">Logout</NuxtLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="py-4">
      <slot />
    </main>

    <footer :class="['py-4 text-center small mt-auto', isDarkMode ? 'text-secondary border-top border-secondary' : 'text-muted']">
      &copy; {{ new Date().getFullYear() }} Diamond Jewelery Calculator App.
    </footer>
  </div>
</template>

<script setup>
const isDarkMode = ref(false)

onMounted(() => {
  const savedMode = localStorage.getItem('darkMode')
  if (savedMode === 'true') {
    isDarkMode.value = true
    document.body.classList.add('dark-mode')
  }
})

const toggleDarkMode = () => {
  isDarkMode.value = !isDarkMode.value
  localStorage.setItem('darkMode', isDarkMode.value)
  if (isDarkMode.value) {
    document.body.classList.add('dark-mode')
  } else {
    document.body.classList.remove('dark-mode')
  }
}

provide('isDarkMode', isDarkMode)
</script>

<style>
:root {
  --primary-gradient: linear-gradient(135deg, #4776E6 0%, #8E54E9 100%);
  --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  --warning-gradient: linear-gradient(135deg, #f46b45 0%, #eea849 100%);
}

body.dark-mode {
  background-color: #121212;
  color: #f1f1f1;
}

body.dark-mode .card {
  background-color: #1e1e1e;
  border-color: #333;
  color: #f1f1f1;
}

body.dark-mode .text-dark,
body.dark-mode .card-title,
body.dark-mode .h3,
body.dark-mode .h4,
body.dark-mode .h5 {
  color: #ffffff !important;
}

body.dark-mode .text-muted {
  color: #a0a0a0 !important;
}

body.dark-mode .bg-light {
  background-color: #2c2c2c !important;
}

body.dark-mode .table {
  color: #f1f1f1;
  border-color: #444;
}

body.dark-mode .table-light {
  background-color: #333 !important;
  color: #fff;
}

body.dark-mode .list-group-item {
  background-color: #1e1e1e;
  border-color: #333;
  color: #f1f1f1;
}

body.dark-mode input, 
body.dark-mode select, 
body.dark-mode textarea {
  background-color: #2c2c2c;
  border-color: #444;
  color: #fff;
}

body.dark-mode input:focus, 
body.dark-mode select:focus {
  background-color: #333;
  color: #fff;
  border-color: #4776E6;
}

body.dark-mode .navbar-brand {
  color: #fff !important;
}

body.dark-mode .btn-outline-primary {
  color: #4776E6;
  border-color: #4776E6;
}

body.dark-mode .btn-outline-primary:hover {
  background-color: #4776E6;
  color: #fff;
}

/* Mobile Native Feel Refinements */
@media (max-width: 768px) {
  .container {
    padding-left: 12px;
    padding-right: 12px;
  }
  .card-body {
    padding: 1rem !important;
  }
  .py-4 {
    padding-top: 1rem !important;
    padding-bottom: 1rem !important;
  }
  .header h1 {
    font-size: 1.5rem;
  }
  .btn {
    padding-top: 0.6rem;
    padding-bottom: 0.6rem;
  }
}
</style>

<style scoped>
.navbar {
  transition: all 0.3s ease;
}
.bg-primary {
  background: var(--primary-gradient) !important;
}
.nav-link {
  transition: opacity 0.2s ease;
}
.nav-link.active {
  font-weight: bold;
  opacity: 1 !important;
}
</style>
