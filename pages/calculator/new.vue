<template>
  <div class="container px-2 py-3 px-md-3 py-md-4">
    <div class="card border-0 shadow-lg rounded-4 overflow-hidden" :class="isDarkMode ? 'bg-dark-card border-secondary' : 'bg-white'">
      <div class="card-header border-0 p-4 text-center" :class="isDarkMode ? 'bg-secondary text-white' : 'bg-primary text-white'">
        <div class="d-flex align-items-center justify-content-center mb-2">
          <img src="../public/logo.png" alt="Al hayat Logo" class="me-2" style="height: 40px;">
          <h1 class="h3 mb-0">Al Hayat Jeweler</h1>
        </div>
        <p class="mb-0 small opacity-75">Professional Moti Calculation System</p>
      </div>

      <div class="card-body p-2 p-md-4">
        <!-- SET INFO -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <h3 class="h5 border-bottom pb-2 mb-3">⚙️ Set Information</h3>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold small">Set Name</label>
                <input v-model="calculation.setName" type="text" class="form-control" placeholder="e.g. Bridal Set A">
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold small">Labour Cost per Set (Rs)</label>
                <input v-model.number="calculation.labourPerSet" type="number" class="form-control" min="0" step="0.01">
              </div>
            </div>

            <!-- Image Upload Box -->
            <div class="mt-3 p-4 border-2 border-dashed rounded-4 text-center position-relative" :class="isDarkMode ? 'bg-dark' : 'bg-light'" style="min-height: 120px; transition: all 0.3s ease;">
              <div v-if="!calculation.setImageUrl">
                <div class="display-6 mb-2 opacity-50">📸</div>
                <label class="form-label d-block fw-bold small mb-2">Set Image</label>
                <input type="file" @change="handleImageUpload" class="stretched-link opacity-0 position-absolute w-100 h-100 start-0 top-0 cursor-pointer" accept="image/*">
                <span class="text-muted small">Click or drag image here</span>
              </div>
              <div v-else class="position-relative">
                <img :src="calculation.setImageUrl" class="img-fluid rounded-3 shadow-sm" style="max-height: 180px;">
                <button @click="calculation.setImageUrl = null" class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2 shadow">✕</button>
              </div>
            </div>

            <!-- Notes/Description -->
            <div class="mt-4">
              <label class="form-label fw-bold small">Notes / Description</label>
              <textarea v-model="calculation.notes" class="form-control" rows="2" placeholder="Add any special instructions or notes..."></textarea>
            </div>

            <div class="mt-4">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <strong class="text-primary small">Moti Types (Standard)</strong>
                <button @click="addMoti" class="btn btn-sm btn-outline-primary">+ Add Type</button>
              </div>
              <div v-for="(moti, index) in calculation.motiRequirements" :key="index" class="row g-2 mb-2 align-items-center bg-light p-2 rounded-2 mx-0">
                <div class="col-5">
                  <input v-model="moti.type" type="text" class="form-control form-control-sm" placeholder="Type">
                </div>
                <div class="col-3">
                  <input v-model.number="moti.lariPerSet" type="number" class="form-control form-control-sm" placeholder="Lari/Set">
                </div>
                <div class="col-3">
                  <input v-model.number="moti.ratePerLari" type="number" class="form-control form-control-sm" placeholder="Rate">
                </div>
                <div class="col-1 text-end">
                  <button @click="removeMoti(index)" class="btn btn-sm btn-link text-danger p-0">✕</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- COLOURS -->
        <div class="card border-0 shadow-sm mb-4">
          <div class="card-body">
            <h3 class="h5 border-bottom pb-2 mb-3">🎨 Colours & Quantities</h3>
            <div v-for="(colour, cIndex) in calculation.colours" :key="cIndex" class="mb-4 border rounded-3 p-3">
              <div class="row g-3 align-items-end mb-3">
                <div class="col-md-5">
                  <label class="form-label small fw-bold">Colour Name</label>
                  <input v-model="colour.name" type="text" class="form-control" placeholder="e.g. Red">
                </div>
                <div class="col-md-4">
                  <label class="form-label small fw-bold">Quantity (Sets)</label>
                  <input v-model.number="colour.qty" type="number" class="form-control">
                </div>
                <div class="col-md-3 text-end">
                  <button @click="removeColour(cIndex)" class="btn btn-outline-danger btn-sm">Delete Colour</button>
                </div>
              </div>
              
              <div class="form-check form-switch mb-3">
                <input v-model="colour.hasCustom" class="form-check-input" type="checkbox" :id="'custom-' + cIndex">
                <label class="form-check-label small" :for="'custom-' + cIndex">Use Custom Moti Settings</label>
              </div>

              <div v-if="colour.hasCustom" class="bg-light p-3 rounded-3">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small fw-bold">Custom Motis</span>
                  <button @click="addCustomMoti(cIndex)" class="btn btn-sm btn-link p-0">+ Add</button>
                </div>
                <div v-for="(moti, mIndex) in colour.customMoti" :key="mIndex" class="row g-2 mb-2 align-items-center">
                  <div class="col-4">
                    <input v-model="moti.type" type="text" class="form-control form-control-sm" placeholder="Type">
                  </div>
                  <div class="col-3">
                    <input v-model.number="moti.lariPerSet" type="number" class="form-control form-control-sm" placeholder="Lari">
                  </div>
                  <div class="col-3">
                    <input v-model.number="moti.ratePerLari" type="number" class="form-control form-control-sm" placeholder="Rate">
                  </div>
                  <div class="col-2 text-end">
                    <button @click="removeCustomMoti(cIndex, mIndex)" class="btn btn-sm btn-link text-danger p-0">✕</button>
                  </div>
                </div>
              </div>
            </div>
            <button @click="addColour" class="btn btn-primary d-block w-100">+ Add Colour</button>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="d-grid gap-2 d-md-flex justify-content-center mb-4 no-print">
          <button @click="calculateAndSave" class="btn btn-success px-4" :disabled="loading">
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            🧮 Calculate & Save
          </button>
          <button v-if="results" @click="exportToPDF" class="btn btn-primary px-4">
            📄 Export as PDF
          </button>
          <button @click="resetForm" class="btn btn-outline-secondary px-4">🔄 Reset</button>
        </div>

        <!-- RESULTS -->
        <div v-if="results" class="results-container">
          <!-- Print Only Header -->
          <div class="print-header d-none">
            <img src="../public/logo.png" style="height: 60px; margin-bottom: 10px;">
            <h2 class="h3 fw-bold">Al Hayat Jeweler</h2>
            <p class="mb-0 small">Moti Calculation Report</p>
            <hr>
            <div class="d-flex justify-content-between mb-4 mt-2">
              <span class="small fw-bold">Date: {{ new Date().toLocaleDateString() }}</span>
              <span class="small fw-bold">Set: {{ results.setName }}</span>
            </div>
            <div v-if="calculation.notes" class="text-start mb-4 p-3 border rounded">
              <div class="fw-bold small mb-1">Notes:</div>
              <div class="small">{{ calculation.notes }}</div>
            </div>
          </div>
          <div v-for="(colour, rIndex) in results.colours" :key="rIndex" class="card border-0 shadow-sm mb-3">
            <div class="card-body">
              <h4 class="h6 fw-bold mb-3">🎨 {{ colour.name }} ({{ colour.qty }} Sets)</h4>
              <div class="table-responsive">
                <table class="table table-sm small">
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th class="text-end">Lari/Set</th>
                      <th class="text-end">Total Lari</th>
                      <th class="text-end">Rate</th>
                      <th class="text-end">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(moti, miIndex) in colour.motiDetails" :key="miIndex">
                      <td>{{ moti.type }}</td>
                      <td class="text-end">{{ moti.lariPerSet }}</td>
                      <td class="text-end">{{ moti.totalLari.toFixed(2) }}</td>
                      <td class="text-end">Rs {{ moti.ratePerLari.toFixed(2) }}</td>
                      <td class="text-end">Rs {{ moti.motiCost.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-light">
                      <td colspan="2"><strong>Colour Total</strong></td>
                      <td class="text-end"><strong>{{ colour.subtotals.totalLari.toFixed(2) }}</strong></td>
                      <td class="text-end"><strong>Labour</strong></td>
                      <td class="text-end"><strong>Rs {{ colour.subtotals.labour.toFixed(2) }}</strong></td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Total Cost</strong></td>
                      <td class="text-end text-primary"><strong>Rs {{ colour.subtotals.total.toFixed(2) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <div class="card border-primary shadow-sm mb-4">
            <div class="card-body bg-primary text-white text-center">
              <h3 class="h5 mb-3">📊 Grand Summary</h3>
              <div class="row g-3">
                <div class="col-6 col-md-3">
                  <div class="small opacity-75">Total Sets</div>
                  <div class="h4 mb-0">{{ results.totals.totalSets }}</div>
                </div>
                <div class="col-6 col-md-3">
                  <div class="small opacity-75">Total Lari</div>
                  <div class="h4 mb-0">{{ results.totals.totalLari.toFixed(2) }}</div>
                </div>
                <div class="col-12 col-md-6 mt-md-0 mt-3">
                  <div class="small opacity-75">Grand Total</div>
                  <div class="display-6 fw-bold">Rs {{ results.totals.grandTotal.toLocaleString() }}</div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-top border-white border-opacity-25 fs-5">
                Cost per Set: <strong>Rs {{ results.totals.costPerSet.toFixed(2) }}</strong>
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

const calculation = ref({
  setName: '',
  labourPerSet: 0,
  setImageUrl: null,
  notes: '',
  motiRequirements: [
    { type: '', lariPerSet: 0, ratePerLari: 0 }
  ],
  colours: [
    { name: '', qty: 0, hasCustom: false, customMoti: [] }
  ]
})

const results = ref(null)
const loading = ref(false)

const addMoti = () => {
  calculation.value.motiRequirements.push({ type: '', lariPerSet: 0, ratePerLari: 0 })
}

const removeMoti = (index) => {
  calculation.value.motiRequirements.splice(index, 1)
}

const addColour = () => {
  calculation.value.colours.push({ name: '', qty: 0, hasCustom: false, customMoti: [] })
}

const removeColour = (index) => {
  calculation.value.colours.splice(index, 1)
}

const addCustomMoti = (cIndex) => {
  if (!calculation.value.colours[cIndex].customMoti) {
    calculation.value.colours[cIndex].customMoti = []
  }
  calculation.value.colours[cIndex].customMoti.push({ type: '', lariPerSet: 0, ratePerLari: 0 })
}

const removeCustomMoti = (cIndex, mIndex) => {
  calculation.value.colours[cIndex].customMoti.splice(mIndex, 1)
}

const handleImageUpload = async (e) => {
  const file = e.target.files[0]
  if (!file) return
  
  // Real implementation would upload to Cloudinary
  // For now, we'll use a data URL
  const reader = new FileReader()
  reader.onload = (event) => {
    calculation.value.setImageUrl = event.target.result
  }
  reader.readAsDataURL(file)
}

const calculateAndSave = async () => {
  loading.value = true
  try {
    const data = calculation.value
    const res = {
      setName: data.setName,
      labourPerSet: data.labourPerSet,
      colours: [],
      totals: {
        totalSets: 0,
        totalLari: 0,
        totalMotiCost: 0,
        totalLabour: 0,
        grandTotal: 0
      }
    }

    data.colours.forEach(colour => {
      const colourResult = {
        name: colour.name,
        qty: colour.qty,
        motiDetails: [],
        subtotals: {
          totalLari: 0,
          motiCost: 0,
          labour: colour.qty * data.labourPerSet,
          total: 0
        }
      }

      const motisToUse = colour.hasCustom ? colour.customMoti : data.motiRequirements

      motisToUse.forEach(moti => {
        const totalLari = moti.lariPerSet * colour.qty
        const motiCost = totalLari * moti.ratePerLari
        colourResult.motiDetails.push({
          type: moti.type,
          lariPerSet: moti.lariPerSet,
          ratePerLari: moti.ratePerLari,
          totalLari,
          motiCost
        })
        colourResult.subtotals.totalLari += totalLari
        colourResult.subtotals.motiCost += motiCost
      })

      colourResult.subtotals.total = colourResult.subtotals.motiCost + colourResult.subtotals.labour
      res.totals.totalSets += colour.qty
      res.totals.totalLari += colourResult.subtotals.totalLari
      res.totals.totalMotiCost += colourResult.subtotals.motiCost
      res.totals.totalLabour += colourResult.subtotals.labour
      res.totals.grandTotal += colourResult.subtotals.total
      res.colours.push(colourResult)
    })

    res.totals.costPerSet = res.totals.totalSets > 0 ? res.totals.grandTotal / res.totals.totalSets : 0
    results.value = res

    // API Call to save
    await $fetch('/api/calculations/create', {
      method: 'POST',
      body: data
    })
    
    alert('Calculation saved successfully!')
  } catch (error) {
    console.error('Sync Error:', error)
    const msg = error.data?.statusMessage || error.message || 'Unknown error'
    alert(`Saved locally, but server sync failed: ${msg}`)
  } finally {
    loading.value = false
  }
}

const exportToPDF = () => {
  window.print()
}

const resetForm = () => {
  if (confirm('Are you sure you want to reset?')) {
    calculation.value = {
      setName: '',
      labourPerSet: 0,
      setImageUrl: null,
      notes: '',
      motiRequirements: [{ type: '', lariPerSet: 0, ratePerLari: 0 }],
      colours: [{ name: '', qty: 0, hasCustom: false, customMoti: [] }]
    }
    results.value = null
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
.border-dashed {
  border-style: dashed !important;
}

@media print {
  /* Hide everything except results */
  body * {
    visibility: hidden !important;
  }
  
  /* Show only the results container and its contents */
  .results-container,
  .results-container * {
    visibility: visible !important;
  }
  
  .print-header,
  .print-header * {
    visibility: visible !important;
  }
  
  /* Position results at top of page */
  .results-container {
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    width: 100% !important;
    padding: 20px !important;
  }
  
  /* Show the print header */
  .print-header {
    display: block !important;
  }
  
  /* Clean up appearance */
  body {
    background: white !important;
    color: black !important;
  }
  
  .card {
    border: 1px solid #ddd !important;
    box-shadow: none !important;
    background-color: white !important;
    color: black !important;
    page-break-inside: avoid;
  }
  
  .table {
    border-collapse: collapse !important;
    width: 100% !important;
    color: black !important;
  }
  
  .table th,
  .table td {
    border: 1px solid #000 !important;
    padding: 8px !important;
    color: black !important;
  }
  
  .text-primary,
  .text-success,
  .text-warning {
    color: black !important;
  }
  
  .bg-primary {
    background-color: #f8f9fa !important;
    color: black !important;
    border: 2px solid #000 !important;
  }
  
  h1, h2, h3, h4, h5, h6 {
    color: black !important;
  }
}
</style>
