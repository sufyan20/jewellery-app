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
                  <span class="badge bg-light text-dark small">{{ new Date(calc.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }}</span>
                </div>
                <div class="small text-muted mb-3">
                  <div>{{ calc.colours.length }} Colours</div>
                  <div>{{ calc._count.gatePasses }} Gate Passes</div>
                </div>
                <div class="display-6 h5 fw-bold text-primary mb-3">
                  Rs {{ Math.round(calculateGrandTotal(calc)).toLocaleString() }}
                </div>
                  <div class="d-flex gap-2 mb-2">
                    <button @click="viewCalculation(calc)" class="btn btn-outline-primary flex-grow-1 py-2">View</button>
                    <button @click="deleteCalculation(calc.id)" class="btn btn-outline-danger py-2" title="Delete">
                      <span class="d-md-none">Delete</span>
                      <span class="d-none d-md-inline">🗑️</span>
                    </button>
                  </div>
                  <button @click="generateGatePass(calc)" class="btn btn-success w-100 py-2">Generate Gate Pass</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>


<!-- Gate Pass Modal -->
<div v-if="showGatePassModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5);" tabindex="-1">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content" :class="isDarkMode ? 'bg-dark-card border-secondary text-white' : 'bg-white'">
      <div class="modal-header border-bottom-0">
        <h5 class="modal-title">Generate Gate Pass</h5>
        <button @click="closeGatePassModal" type="button" class="btn-close" :class="isDarkMode ? 'btn-close-white' : ''"></button>
      </div>
      <div class="modal-body">
        <div class="mb-3">
            <label class="form-label small fw-bold">Gate Pass Number</label>
             <input v-model="gatePassDetails.passNumber" type="text" class="form-control" :class="isDarkMode ? 'bg-dark text-white border-secondary' : ''" placeholder="GP-001">
        </div>
        <div class="mb-3">
             <label class="form-label small fw-bold">Customer Name</label>
             <input v-model="gatePassDetails.customerName" type="text" class="form-control py-2" :class="isDarkMode ? 'bg-dark text-white border-secondary' : ''" placeholder="Enter customer name">
        </div>
      </div>
      <div class="modal-footer border-top-0">
        <button @click="closeGatePassModal" type="button" class="btn btn-outline-secondary">Cancel</button>
        <button @click="submitGatePass" type="button" class="btn btn-primary" :disabled="isGenerating">
            <span v-if="isGenerating" class="spinner-border spinner-border-sm me-2"></span>
            Generate & Print / Save
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Hidden Print Component -->
<div class="d-none d-print-block">
    <GatePassPrint v-if="printGatePassData" :gatePass="printGatePassData" />
</div>

</template>

<script setup>
const isDarkMode = inject('isDarkMode')
const { data: calculations, pending, error, refresh } = useFetch('/api/calculations')

// Gate Pass State
const showGatePassModal = ref(false)
const isGenerating = ref(false)
const selectedCalcForPass = ref(null)
const printGatePassData = ref(null)
const gatePassDetails = ref({
    passNumber: '',
    customerName: ''
})

const deleteCalculation = async (id) => {
  if (!confirm('Are you sure you want to delete this calculation? This cannot be undone.')) return

  try {
    await $fetch(`/api/calculations/delete?id=${id}`, {
      method: 'DELETE'
    })
    // Refresh the list locally
    await refresh()
  } catch (err) {
    alert('Failed to delete calculation')
    console.error(err)
  }
}

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
  navigateTo(`/calculator/${calc.id}`)
}

const generateGatePass = (calc) => {
  selectedCalcForPass.value = calc
  gatePassDetails.value = {
      passNumber: 'GP-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
      customerName: ''
  }
  showGatePassModal.value = true
}

const closeGatePassModal = () => {
    showGatePassModal.value = false
    selectedCalcForPass.value = null
}

const submitGatePass = async () => {
    if (!selectedCalcForPass.value) return
    isGenerating.value = true
    try {
         const res = await $fetch('/api/gatepass/create', {
          method: 'POST',
          body: {
            ...gatePassDetails.value,
            calculationId: selectedCalcForPass.value.id
          }
        })
        
        // Prepare for printing
        printGatePassData.value = res
        
        // Wait for DOM update then print
        closeGatePassModal()
        setTimeout(() => {
            window.print()
            // Reset print data after print dialog closes (users might cancel, but data lingering is fine, or clear it after some time)
            // setTimeout(() => printGatePassData.value = null, 5000)
        }, 500)

    } catch(err) {
        alert('Failed to generate gate pass')
        console.error(err)
    } finally {
        isGenerating.value = false
    }
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

@media print {
  /* We strictly hide the main UI container to prevent it showing up in print */
  .container {
      display: none !important;
  }
  
  /* Also hide modal backdrop if open */
  .modal-backdrop {
      display: none !important;
  }
}
</style>
