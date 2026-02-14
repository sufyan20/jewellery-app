<template>
  <div class="container px-2 py-3 px-md-3 py-md-4">
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">
      failed: {{ error.message }} 
    </div>
    <div v-else class="card border-0 shadow-lg rounded-4 overflow-hidden" :class="isDarkMode ? 'bg-dark-card border-secondary' : 'bg-white'">
      <div class="card-header border-0 bg-transparent pt-4 pb-2 text-center no-print">
        <h2 class="h4 fw-bold mb-1 text-primary">Edit Calculation</h2>
        <p class="small text-muted">Update existing estimation</p>
      </div>

      <div class="card-body p-2 p-md-4">
        <!-- SET INFO -->
        <div class="card border-0 shadow-sm mb-4 no-print">
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
                <input type="file" @change="handleImageUpload" class="stretched-link opacity-0 position-absolute w-100 h-100 start-0 top-0 cursor-pointer" accept="image/jpeg,image/png,image/webp">
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
        <div class="card border-0 shadow-sm mb-4 no-print">
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
          <button @click="calculateAndSave" class="btn btn-warning px-4 text-white" :disabled="saving">
            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
            💾 Update & Save
          </button>
          <button @click="$router.back()" class="btn btn-outline-secondary px-4">Cancel</button>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const router = useRouter()
const isDarkMode = inject('isDarkMode')
const calculationId = route.params.id

// Fetch existing data
const { data: existingData, pending, error } = useFetch(`/api/calculations/${calculationId}`)

const calculation = ref({
  setName: '',
  labourPerSet: 0,
  setImageUrl: null,
  notes: '',
  motiRequirements: [],
  colours: []
})

const saving = ref(false)

// Populate form when data is fetched
watch(existingData, (newData) => {
    if (newData) {
        calculation.value = {
            id: newData.id,
            setName: newData.setName,
            labourPerSet: newData.labourPerSet,
            setImageUrl: newData.setImageUrl,
            notes: newData.notes || '',
            motiRequirements: newData.motiRequirements.map(m => ({
                type: m.type,
                lariPerSet: m.lariPerSet,
                ratePerLari: m.ratePerLari
            })),
            colours: newData.colours.map(c => ({
                name: c.name,
                qty: c.qty,
                hasCustom: c.hasCustom,
                customMoti: c.customMotis ? c.customMotis.map(m => ({
                    type: m.type,
                    lariPerSet: m.lariPerSet,
                    ratePerLari: m.ratePerLari
                })) : []
            }))
        }
    }
}, { immediate: true })

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

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (!file) return

  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height
      const maxWidth = 700
      const maxHeight = 800

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      if (height > maxHeight) {
        width = Math.round((width * maxHeight) / height)
        height = maxHeight
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)
      
      // Save as compressed JPEG
      calculation.value.setImageUrl = canvas.toDataURL('image/jpeg', 0.9)
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}

const calculateAndSave = async () => {
  saving.value = true
  try {
    const data = calculation.value
    
    // API Call to update
    await $fetch('/api/calculations/update', {
      method: 'PUT',
      body: { ...data, id: calculationId }
    })
    
    alert('Calculation updated successfully!')
    router.push(`/calculator/${calculationId}`)
  } catch (error) {
    console.error('Update Error:', error)
    const msg = error.data?.statusMessage || error.message || 'Unknown error'
    alert(`Update failed: ${msg}`)
  } finally {
    saving.value = false
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
</style>
