<template>
  <div class="container px-2 py-3 px-md-3 py-md-4">
    <div v-if="pending" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>
    <div v-else-if="error" class="alert alert-danger">
      {{ error.message }}
    </div>
    <div v-else class="card border-0 shadow-lg rounded-4 overflow-hidden" :class="isDarkMode ? 'bg-dark-card border-secondary' : 'bg-white'">
      
      <!-- HEADER -->
      <!-- HEADER -->
      <div class="card-header border-0 bg-transparent pt-4 pb-2 text-center">
         <div class="d-flex justify-content-between align-items-center w-100 position-absolute top-0 start-0 p-3">
             <button @click="$router.back()" class="btn btn-sm btn-outline-secondary">← Back</button>
         </div>
        <h2 class="h4 fw-bold mb-1 text-primary">{{ calculation.setName }}</h2>
        <p class="small text-muted mb-0">{{ new Date(calculation.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }}</p>
      </div>

      <div class="card-body p-2 p-md-4">
        
        <!-- IMAGE -->
        <div v-if="calculation.setImageUrl" class="mb-4 text-center">
            <img :src="calculation.setImageUrl" class="img-fluid rounded-3 shadow-sm" style="max-height: 300px;">
        </div>

        <!-- NOTES -->
        <div v-if="calculation.notes" class="mb-4 p-3 bg-light rounded text-center">
            <span class="fw-bold small d-block mb-1">Notes</span>
            {{ calculation.notes }}
        </div>

        <!-- RE-CALCULATED RESULTS -->
        <div v-if="results" class="results-container">
          <div v-for="(colour, rIndex) in results.colours" :key="rIndex" class="card border-0 shadow-sm mb-3">
            <div class="card-body p-3">
              <h4 class="h6 fw-bold mb-3 d-flex justify-content-between">
                  <span>🎨 {{ colour.name }}</span>
                  <span class="badge bg-light text-dark">{{ colour.qty }} Sets</span>
              </h4>
              
              <!-- Mobile Friendly List View instead of Table -->
              <div class="d-md-none">
                  <div v-for="(moti, miIndex) in colour.motiDetails" :key="miIndex" class="mb-2 pb-2 border-bottom border-light">
                      <div class="d-flex justify-content-between fw-bold small">
                          <span>{{ moti.type }}</span>
                          <span>Rs {{ Math.round(moti.motiCost) }}</span>
                      </div>
                      <div class="d-flex justify-content-between small text-muted">
                          <span>{{ moti.lariPerSet }} Lari/Set × {{ colour.qty }}</span>
                          <span>@ {{ moti.ratePerLari }}/Lari</span>
                      </div>
                  </div>
                  <div class="d-flex justify-content-between small mt-2">
                       <span>Labour</span>
                       <span>Rs {{ Math.round(colour.subtotals.labour) }}</span>
                  </div>
                   <div class="d-flex justify-content-between fw-bold text-primary mt-2 pt-2 border-top">
                       <span>Total</span>
                       <span>Rs {{ Math.round(colour.subtotals.total) }}</span>
                  </div>
              </div>

              <!-- Desktop Table View -->
              <div class="table-responsive d-none d-md-block">
                <table class="table table-sm small mb-0">
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
                      <td class="text-end">Rs {{ Math.round(moti.motiCost) }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr class="table-light">
                      <td colspan="2"><strong>Colour Total</strong></td>
                      <td class="text-end"><strong>{{ colour.subtotals.totalLari.toFixed(2) }}</strong></td>
                      <td class="text-end"><strong>Labour</strong></td>
                      <td class="text-end"><strong>Rs {{ Math.round(colour.subtotals.labour) }}</strong></td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-end"><strong>Total Cost</strong></td>
                      <td class="text-end text-primary"><strong>Rs {{ Math.round(colour.subtotals.total) }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- GRAND SUMMARY -->
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
                  <div class="display-6 fw-bold">Rs {{ Math.round(results.totals.grandTotal).toLocaleString() }}</div>
                </div>
              </div>
              <div class="mt-3 pt-3 border-top border-white border-opacity-25 fs-5">
                Cost per Set: <strong>Rs {{ Math.round(results.totals.costPerSet) }}</strong>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
const route = useRoute()
const isDarkMode = inject('isDarkMode')
const { data: calculation, pending, error } = useFetch(`/api/calculations/${route.params.id}`)

// Computed property to re-calculate everything on the client side based on saved data
// This duplicates logic from new.vue but ensures consistency if we change how things are calculated
const results = computed(() => {
    if (!calculation.value) return null
    
    const data = calculation.value
    const res = {
      totals: {
        totalSets: 0,
        totalLari: 0,
        totalMotiCost: 0,
        totalLabour: 0,
        grandTotal: 0
      },
      colours: []
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

      // Handle custom vs standard motis - DB structure might be slightly different than pure form state
      // Prisma include returns 'customMotis' (plural) usually, but check schema if needed. 
      // Based on my view_file of index.get.ts, it is 'customMotis'.
      // data.motiRequirements is standard.
      
      // We need to map the "type" correctly.
      
      const motisToUse = (colour.customMotis && colour.customMotis.length > 0) ? colour.customMotis : data.motiRequirements

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
    return res
})
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
