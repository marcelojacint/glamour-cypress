const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5039',
    viewportWidth: 1280,
    viewportHeight: 800,
    // O cabeçalho da loja é fixo no topo; centralizar evita que ele cubra o elemento clicado
    scrollBehavior: 'center',
    defaultCommandTimeout: 8000,
    video: false,
  },
})
