<template>
  <div class="container px-2 py-3 px-md-3 py-md-5">
    <div class="row g-4 justify-content-center">
      <div class="col-md-8 col-lg-6 text-center mb-4">
        <img src="../public/logo.png" alt="Al hayat Logo" class="mb-3" style="height: 80px;">
        <p class="lead text-muted">Luxury Jewelry Calculation & POS Management</p>
      </div>
    </div>

    <div class="row g-2 g-md-4 justify-content-center">
      <div class="col-12 col-md-4">
        <NuxtLink to="/calculator/new" class="text-decoration-none">
          <div class="card h-100 border-0 shadow-sm hover-up">
            <div class="card-body p-3 p-md-4 text-center">
              <div class="display-4 text-primary mb-3">💎</div>
              <h3 class="h5 fw-bold">New Calculation</h3>
              <p class="small text-muted mb-3">Create a new moti selection and proi cost estimation.</p>
              <div class="d-grid d-md-block">
                <button class="btn btn-primary btn-sm px-4">Start Now</button>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="col-12 col-md-4">
        <NuxtLink to="/history" class="text-decoration-none">
          <div class="card h-100 border-0 shadow-sm hover-up">
            <div class="card-body p-3 p-md-4 text-center">
              <div class="display-4 text-success mb-3">🕒</div>
              <h3 class="h5 fw-bold">View History</h3>
              <p class="small text-muted mb-3">Browse through previous calculations and edit them.</p>
              <div class="d-grid d-md-block">
                <button class="btn btn-success btn-sm px-4">View All</button>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>

      <div class="col-12 col-md-4">
        <NuxtLink to="/gatepass" class="text-decoration-none">
          <div class="card h-100 border-0 shadow-sm hover-up">
            <div class="card-body p-3 p-md-4 text-center">
              <div class="display-4 text-warning mb-3">📄</div>
              <h3 class="h5 fw-bold">Gate Pass</h3>
              <p class="small text-muted mb-3">Generate and print gate passes for customers.</p>
              <div class="d-grid d-md-block">
                <button class="btn btn-warning btn-sm px-4">Generate</button>
              </div>
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hover-up {
  transition: transform 0.3s ease, shadow 0.3s ease;
  cursor: pointer;
}
.hover-up:hover {
  transform: translateY(-10px);
  box-shadow: 0 1rem 3rem rgba(0,0,0,.175) !important;
}
</style>
