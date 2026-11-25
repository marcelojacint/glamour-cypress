Cypress.Commands.add('registrar', (nome, email, senha, confirmacao = senha) => {
  cy.visit('/conta/registrar')
  cy.get('[data-cy="registrar-nome"]').type(nome)
  cy.get('[data-cy="registrar-email"]').type(email)
  cy.get('[data-cy="registrar-senha"]').type(senha, { log: false })
  cy.get('[data-cy="registrar-confirmacao"]').type(confirmacao, { log: false })
  cy.get('[data-cy="registrar-enviar"]').click()
})

Cypress.Commands.add('login', (email, senha) => {
  cy.visit('/conta/login')
  cy.get('[data-cy="login-email"]').type(email)
  cy.get('[data-cy="login-senha"]').type(senha, { log: false })
  cy.get('[data-cy="login-entrar"]').click()
})

// Adiciona 1 unidade pela página do produto e devolve a requisição interceptada
Cypress.Commands.add('adicionarAoCarrinho', (slug) => {
  cy.intercept('GET', '/carrinho/quantidade').as('quantidadeCarrinho')
  cy.intercept('POST', '/carrinho/adicionar').as('adicionarAoCarrinho')

  cy.visit(`/produto/${slug}`)
  // O cabeçalho consulta o contador ao carregar e é essa resposta que cria a sessão do carrinho.
  // Esperar por ela evita que a adição abra uma segunda sessão e o item suma do carrinho.
  cy.wait('@quantidadeCarrinho')

  cy.get('[data-cy="produto-adicionar"]').should('be.enabled').click()

  return cy.wait('@adicionarAoCarrinho').then((requisicao) => {
    expect(requisicao.response.statusCode).to.eq(200)
    expect(requisicao.response.body.ok).to.eq(true)
    return requisicao
  })
})
