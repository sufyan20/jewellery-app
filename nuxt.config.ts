// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@vite-pwa/nuxt'
  ],
  css: [
    'bootstrap/dist/css/bootstrap.min.css'
  ],
  app: {
    head: {
      title: 'Diamond Jewelery Calculator',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ]
    }
  },
  pwa: {
    manifest: {
      name: 'Jewelary POS & Calculator',
      short_name: 'JewelaryApp',
      description: 'Jewelary calculation and inventory management app',
      theme_color: '#4776E6',
      background_color: '#ffffff',
      display: 'standalone'
    }
  },
  runtimeConfig: {
    public: {
      cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME,
      cloudinaryUploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    }
  },
  nitro: {
    experimental: {
      openAPI: true
    }
  }
})
