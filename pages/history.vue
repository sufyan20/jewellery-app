<template>
  <div class="container px-2 py-3 px-md-3 py-md-4">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden" :class="isDarkMode ? 'bg-dark-card border-secondary' : 'bg-white'">
      <div class="card-header border-0 p-4 text-center" :class="isDarkMode ? 'bg-secondary text-white' : 'bg-primary text-white'">
        <h1 class="h3 mb-0">🕒 Calculation History</h1>
      </div>

      <div class="card-body p-2 p-md-4">
        <div v-if="pending" class="text-center py-5">
          <div class="spinner-border text-primary" role="status"></div>
          <p class="mt-2 text-muted">Loading history...</p>
        </div>

        <div v-else-if="error" class="alert alert-danger">
          Error loading calculations: {{ error.message }}
        </div>

        <div v-else-if="calculations.length === 0" class="text-center py-5">
          <p class="text-muted">No calculations found. Start by creating one!</p>
          <button @click="$router.push('/calculator/new')" class="btn btn-primary px-4">Create New</button>
        </div>

        <div v-else class="row g-4">
          <div v-for="calc in calculations" :key="calc.id" class="col-md-6 col-lg-4">
            <div class="card h-100 border-0 shadow-sm">
              <div v-if="calc.setImageUrl" class="card-img-top overflow-hidden" style="height: 150px;">
                <img :src="calc.setImageUrl" class="w-100 h-100 object-fit-cover">
              </div>
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <h5 class="card-title h6 fw-bold mb-0">{{ calc.setName }}</h5>
                  <span class="badge bg-light text-dark small">{{ new Date(calc.createdAt).toLocaleDateString() }}</span>
                </div>
                <div class="small text-muted mb-3">
                  <div>{{ calc.colours.length }} Colours</div>
                  <div>{{ calc._count.gatePasses }} Gate Passes</div>
                </div>
                <div class="display-6 h5 fw-bold text-primary mb-3">
                  Rs {{ calculateGrandTotal(calc).toLocaleString() }}
                </div>
                <div class="d-grid gap-2">
                  <button @click="viewCalculation(calc)" class="btn btn-sm btn-outline-primary">View Details</button>
                  <button @click="generateGatePass(calc)" class="btn btn-sm btn-success">Generate Gate Pass</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const isDarkMode = inject('isDarkMode')
const { data: calculations, pending, error } = useFetch('/api/calculations')

const calculateGrandTotal = (calc) => {
  let total = 0
  calc.colours.forEach(colour => {
    let labour = colour.qty * calc.labourPerSet
    let motiCost = 0
    const motis = colour.hasCustom ? colour.customMotis : calc.motiRequirements
    motis.forEach(moti => {
      motiCost += (moti.lariPerSet * colour.qty) * moti.ratePerLari
    })
    total += labour + motiCost
  })
  return total
}

const viewCalculation = (calc) => {
  // Navigation to detail view
  alert(`Viewing details for ${calc.setName}`)
}

const generateGatePass = (calc) => {
  // Navigation to gatepass with calc ID
}
</script>

<style scoped>
.bg-primary {
  background: var(--primary-gradient) !important;
}
.bg-secondary {
  background: linear-gradient(135deg, #2c3e50 0%, #000000 100%) !important;
}
.bg-dark-card {
  background-color: #1e1e1e !important;
}
</style>
