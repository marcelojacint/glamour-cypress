import './commands'

Cypress.on('window:before:load', (win) => {
  // Já marca o aviso de cookies como aceito: a faixa fixa no rodapé cobriria os botões
  win.localStorage.setItem('glamour_cookie_consent', 'accepted')

  // Impede o registro do service worker da loja, que guarda arquivos em cache entre os testes
  delete Object.getPrototypeOf(win.navigator).serviceWorker
})
