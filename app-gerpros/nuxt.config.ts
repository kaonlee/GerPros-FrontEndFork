// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  plugins: ['@/plugins/themeChange.client.js'],
  modules: ['@nuxt/eslint', '@nuxt/image', '@nuxtjs/tailwindcss'],
  build: {
    transpile: ['vue-countup-v3'],
  },
  compatibilityDate: '2024-08-22',
  runtimeConfig: {
    public: {
      //or use env variables
      apiBase: 'https://gerpros.apalan60-tst.click/api',
    },
  },
});
