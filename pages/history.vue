<template>
  <div class="history-page">

    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">🕒 History</h1>
      <button @click="$router.push('/calculator/new')" class="btn-new">
        <span>＋</span> New
      </button>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="state-box">
      <div class="spinner"></div>
      <p class="state-text">Loading history...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="alert-error">
      ⚠️ Error loading calculations: {{ error.message }}
    </div>

    <!-- Empty State -->
    <div v-else-if="calculations.length === 0" class="state-box">
      <div class="empty-icon">📋</div>
      <p class="state-text">No calculations yet.</p>
      <p class="state-subtext">Start by creating your first one!</p>
      <button @click="$router.push('/calculator/new')" class="btn-primary-full">
        ＋ Create New Calculation
      </button>
    </div>

    <!-- Cards List -->
    <div v-else class="cards-list">
      <div
        v-for="calc in calculations"
        :key="calc.id"
        class="calc-card"
        :class="{ 'dark-card': isDarkMode }"
      >
        <!-- Card Top: Image (if any) -->
        <div v-if="calc.setImageUrl" class="card-image-wrap">
          <img :src="calc.setImageUrl" class="card-image" alt="Set image" />
        </div>

        <!-- Card Body -->
        <div class="card-body">
          <!-- Title Row -->
          <div class="card-title-row">
            <h2 class="card-name">{{ calc.setName }}</h2>
            <span class="card-date">
              {{ formatDate(calc.createdAt) }}
            </span>
          </div>

          <!-- Meta Row -->
          <div class="card-meta">
            <span class="meta-chip">🎨 {{ calc.colours.length }} colours</span>
            <span class="meta-chip">📄 {{ calc._count.gatePasses }} passes</span>
          </div>

          <!-- Total -->
          <div class="card-total" :class="isDarkMode ? 'total-dark' : 'total-light'">
            Rs {{ Math.round(calculateGrandTotal(calc)).toLocaleString() }}
          </div>

          <!-- Action Buttons -->
          <div class="card-actions">
            <button @click="viewCalculation(calc)" class="action-btn btn-view" title="View">
              👁 View
            </button>
            <button @click="editCalculation(calc)" class="action-btn btn-edit" title="Edit">
              ✏️ Edit
            </button>
            <button @click="duplicateCalculation(calc)" class="action-btn btn-duplicate" title="Duplicate">
              ⧉ Copy
            </button>
            <button @click="confirmDelete(calc.id)" class="action-btn btn-delete" title="Delete">
              🗑
            </button>
          </div>

          <!-- Generate Gate Pass full-width -->
          <button @click="generateGatePass(calc)" class="btn-gatepass">
            📄 Generate Gate Pass
          </button>
        </div>
      </div>
    </div>

    <!-- Gate Pass Modal -->
    <Teleport to="body">
      <div v-if="showGatePassModal" class="modal-overlay" @click.self="closeGatePassModal">
        <div class="modal-sheet" :class="isDarkMode ? 'modal-dark' : 'modal-light'">
          <div class="modal-handle"></div>
          <div class="modal-header">
            <h3 class="modal-title">📄 Gate Pass Details</h3>
            <button @click="closeGatePassModal" class="modal-close">✕</button>
          </div>
          <div class="modal-body">
            <div class="field-group">
              <label class="field-label">Gate Pass Number</label>
              <input
                v-model="gatePassDetails.passNumber"
                type="text"
                class="field-input"
                :class="isDarkMode ? 'input-dark' : ''"
                placeholder="GP-001"
              />
            </div>
            <div class="field-group">
              <label class="field-label">Customer Name</label>
              <input
                v-model="gatePassDetails.customerName"
                type="text"
                class="field-input"
                :class="isDarkMode ? 'input-dark' : ''"
                placeholder="Enter customer name"
              />
            </div>
          </div>
          <div class="modal-footer">
            <button @click="closeGatePassModal" class="btn-cancel">Cancel</button>
            <button @click="submitGatePass" class="btn-submit" :disabled="isGenerating || isSharing">
              <span v-if="isGenerating || isSharing" class="btn-spinner"></span>
              Share / Save PDF
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation Modal -->
    <Teleport to="body">
      <div v-if="showDeleteModal" class="modal-overlay" @click.self="showDeleteModal = false">
        <div class="modal-sheet modal-sheet-sm" :class="isDarkMode ? 'modal-dark' : 'modal-light'">
          <div class="modal-handle"></div>
          <div class="modal-body text-center">
            <div class="delete-icon">🗑️</div>
            <h3 class="delete-title">Delete Record?</h3>
            <p class="delete-text">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button @click="showDeleteModal = false" class="btn-cancel">Cancel</button>
            <button @click="executeDelete" class="btn-delete-confirm" :disabled="isDeleting">
              <span v-if="isDeleting" class="btn-spinner"></span>
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Hidden Print Component -->
    <div class="d-none d-print-block">
      <GatePassPrint v-if="printGatePassData" :gatePass="printGatePassData" />
    </div>
  </div>
</template>

<script setup>
import { usePdfShare } from '~/composables/usePdfShare'

const isDarkMode = inject('isDarkMode')
const { data: calculations, pending, error, refresh } = useFetch('/api/calculations')

// Gate Pass State
const showGatePassModal = ref(false)
const isGenerating = ref(false)
const selectedCalcForPass = ref(null)
const printGatePassData = ref(null)
const gatePassDetails = ref({ passNumber: '', customerName: '' })
const { shareOrDownloadPDF, isSharing } = usePdfShare()

// Delete State
const showDeleteModal = ref(false)
const pendingDeleteId = ref(null)
const isDeleting = ref(false)

// Duplicate State — navigates to new page with prefilled data, no async needed

// ---- Helpers ----
const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  })
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

// ---- Actions ----
const viewCalculation = (calc) => navigateTo(`/calculator/${calc.id}`)
const editCalculation = (calc) => navigateTo(`/calculator/edit/${calc.id}`)

const confirmDelete = (id) => {
  pendingDeleteId.value = id
  showDeleteModal.value = true
}

const executeDelete = async () => {
  if (!pendingDeleteId.value) return
  isDeleting.value = true
  try {
    await $fetch(`/api/calculations/delete?id=${pendingDeleteId.value}`, { method: 'DELETE' })
    await refresh()
    showDeleteModal.value = false
    pendingDeleteId.value = null
  } catch (err) {
    alert('Failed to delete calculation')
    console.error(err)
  } finally {
    isDeleting.value = false
  }
}

const duplicateCalculation = (calc) => {
  // Map DB shape to the form shape expected by new.vue
  const prefill = {
    setName: `Copy of ${calc.setName}`,
    labourPerSet: calc.labourPerSet,
    setImageUrl: calc.setImageUrl || null,
    notes: calc.notes || '',
    motiRequirements: calc.motiRequirements.map(m => ({
      type: m.type,
      lariPerSet: m.lariPerSet,
      ratePerLari: m.ratePerLari
    })),
    colours: calc.colours.map(c => ({
      name: c.name,
      qty: c.qty,
      hasCustom: c.hasCustom,
      customMoti: (c.customMotis || []).map(cm => ({
        type: cm.type,
        lariPerSet: cm.lariPerSet,
        ratePerLari: cm.ratePerLari
      }))
    }))
  }
  sessionStorage.setItem('duplicatePrefill', JSON.stringify(prefill))
  navigateTo('/calculator/new')
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
      body: { ...gatePassDetails.value, calculationId: selectedCalcForPass.value.id }
    })
    await shareOrDownloadPDF(res, 'gatepass', `GatePass-${res.passNumber}.pdf`)
    closeGatePassModal()
  } catch (err) {
    alert('Failed to generate gate pass')
    console.error(err)
  } finally {
    isGenerating.value = false
  }
}
</script>

<style scoped>
/* ================================
   PAGE LAYOUT
================================ */
.history-page {
  padding: 12px;
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 80px;
}

/* ================================
   HEADER
================================ */
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 4px 0;
}

.page-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  letter-spacing: -0.3px;
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  background: var(--primary-gradient, linear-gradient(135deg, #667eea, #764ba2));
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.35);
}

.btn-new:active {
  transform: scale(0.96);
  opacity: 0.9;
}

/* ================================
   STATES
================================ */
.state-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 48px 24px;
  gap: 8px;
}

.spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(0,0,0,0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-icon { font-size: 3rem; }
.state-text { font-size: 1rem; font-weight: 600; margin: 0; color: #555; }
.state-subtext { font-size: 0.875rem; color: #888; margin: 0; }

.alert-error {
  background: #fff0f0;
  border: 1px solid #fca5a5;
  border-radius: 12px;
  padding: 14px 16px;
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 12px;
}

.btn-primary-full {
  margin-top: 8px;
  padding: 12px 24px;
  background: var(--primary-gradient, linear-gradient(135deg, #667eea, #764ba2));
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  max-width: 280px;
}

/* ================================
   CARDS LIST
================================ */
.cards-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.calc-card {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: transform 0.15s, box-shadow 0.15s;
}

.calc-card:active {
  transform: scale(0.995);
}

.dark-card {
  background: #1e1e1e;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
}

/* Image */
.card-image-wrap {
  height: 140px;
  overflow: hidden;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Card Body */
.card-body {
  padding: 14px 16px 16px;
}

/* Title Row */
.card-title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 8px;
}

.card-name {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  flex: 1;
  line-height: 1.3;
}

.card-date {
  font-size: 0.72rem;
  color: #888;
  background: #f3f4f6;
  border-radius: 8px;
  padding: 3px 8px;
  white-space: nowrap;
  flex-shrink: 0;
  margin-top: 2px;
}

.dark-card .card-date {
  background: #2a2a2a;
  color: #aaa;
}

/* Meta chips */
.card-meta {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.meta-chip {
  font-size: 0.75rem;
  color: #666;
  background: #f3f4f6;
  border-radius: 20px;
  padding: 3px 10px;
}

.dark-card .meta-chip {
  background: #2a2a2a;
  color: #bbb;
}

/* Total */
.card-total {
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: 14px;
  letter-spacing: -0.5px;
}

.total-light {
  background: var(--primary-gradient, linear-gradient(135deg, #667eea, #764ba2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.total-dark {
  color: #a78bfa;
}

/* Action Buttons Row */
.card-actions {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr auto;
  gap: 8px;
  margin-bottom: 10px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 10px 6px;
  border-radius: 10px;
  border: 1.5px solid transparent;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s, opacity 0.15s;
  min-height: 42px;
  white-space: nowrap;
}

.action-btn:active { transform: scale(0.95); }
.action-btn:disabled { opacity: 0.55; cursor: not-allowed; }

.btn-view {
  background: #eff6ff;
  border-color: #bfdbfe;
  color: #2563eb;
}
.btn-view:active { background: #dbeafe; }

.btn-edit {
  background: #fffbeb;
  border-color: #fde68a;
  color: #d97706;
}
.btn-edit:active { background: #fef3c7; }

.btn-duplicate {
  background: #f0fdf4;
  border-color: #bbf7d0;
  color: #16a34a;
}
.btn-duplicate:active { background: #dcfce7; }

.btn-delete {
  background: #fff1f2;
  border-color: #fecdd3;
  color: #dc2626;
  min-width: 42px;
  padding: 10px;
}
.btn-delete:active { background: #fee2e2; }

/* Gate Pass button */
.btn-gatepass {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.15s;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
}
.btn-gatepass:active {
  transform: scale(0.98);
  opacity: 0.9;
}

/* Spinner inline */
.btn-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  vertical-align: middle;
  margin-right: 4px;
}

/* ================================
   MODALS (bottom sheet style)
================================ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  z-index: 1000;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

.modal-sheet {
  width: 100%;
  max-width: 500px;
  border-radius: 20px 20px 0 0;
  padding: 0 0 env(safe-area-inset-bottom, 12px);
  animation: slideUp 0.25s cubic-bezier(0.32, 0.72, 0, 1);
}

.modal-sheet-sm {
  max-width: 400px;
}

@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}

.modal-light { background: #fff; }
.modal-dark  { background: #1e1e1e; color: #f1f1f1; }

.modal-handle {
  width: 40px;
  height: 4px;
  background: #d1d5db;
  border-radius: 99px;
  margin: 12px auto 0;
}

.modal-dark .modal-handle { background: #444; }

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px 12px;
  border-bottom: 1px solid #f3f4f6;
}

.modal-dark .modal-header { border-color: #333; }

.modal-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border: none;
  background: #f3f4f6;
  border-radius: 50%;
  font-size: 0.85rem;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-dark .modal-close { background: #333; color: #ccc; }

.modal-body {
  padding: 16px 20px;
}

.field-group {
  margin-bottom: 14px;
}

.field-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #555;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.modal-dark .field-label { color: #aaa; }

.field-input {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
  box-sizing: border-box;
  background: #fff;
  color: #111;
}

.field-input:focus { border-color: #667eea; }

.input-dark {
  background: #2a2a2a !important;
  border-color: #444 !important;
  color: #f1f1f1 !important;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 12px 20px 16px;
  border-top: 1px solid #f3f4f6;
}

.modal-dark .modal-footer { border-color: #333; }

.btn-cancel {
  flex: 1;
  padding: 13px;
  border: 1.5px solid #e5e7eb;
  border-radius: 12px;
  background: transparent;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  color: #555;
}

.modal-dark .btn-cancel { border-color: #444; color: #bbb; }

.btn-submit {
  flex: 2;
  padding: 13px;
  background: var(--primary-gradient, linear-gradient(135deg, #667eea, #764ba2));
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

/* Delete Modal */
.text-center { text-align: center; }
.delete-icon { font-size: 2.5rem; margin-bottom: 8px; }
.delete-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 6px; }
.delete-text { font-size: 0.875rem; color: #888; margin: 0; }

.btn-delete-confirm {
  flex: 2;
  padding: 13px;
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.btn-delete-confirm:disabled { opacity: 0.6; }

/* ================================
   DESKTOP (tablet+)
================================ */
@media (min-width: 640px) {
  .history-page {
    padding: 24px 16px 80px;
  }

  .page-title { font-size: 1.75rem; }

  .cards-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  .modal-overlay {
    align-items: center;
  }

  .modal-sheet {
    border-radius: 20px;
    max-width: 480px;
  }
}

@media (min-width: 1024px) {
  .cards-list {
    grid-template-columns: repeat(3, 1fr);
  }

  .history-page {
    max-width: 1100px;
  }
}

/* ================================
   PRINT HIDE
================================ */
@media print {
  .history-page { display: none !important; }
}
</style>
