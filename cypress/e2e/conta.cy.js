import { emailUnico } from '../support/utils'

const nome = 'Cliente Cypress'
const senha = 'Teste1234'

describe('Cadastro de cliente', () => {
  context('Dados válidos', () => {
    it('CT01 - deve cadastrar o cliente e entrar logado na loja', () => {
      cy.registrar(nome, emailUnico(), senha)

      cy.location('pathname').should('eq', '/')
      cy.get('[data-cy="menu-conta"]').should('be.visible')
    })
  })

  context('Dados inválidos', () => {
    it('CT02 - deve recusar senha e confirmação diferentes', () => {
      cy.registrar(nome, emailUnico(), 'Teste1234', 'Teste9999')

      cy.get('[data-cy="alerta-erro"]').should('contain.text', 'As senhas não coincidem.')
      cy.location('pathname').should('eq', '/conta/registrar')
      cy.get('[data-cy="menu-conta"]').should('not.exist')
    })

    it('CT03 - deve recusar senha sem número e não criar a conta', () => {
      const email = emailUnico()

      cy.registrar(nome, email, 'abcdefgh')

      cy.location('pathname').should('eq', '/conta/registrar')
      // Hoje a mensagem vem do Identity em inglês ("at least one digit"); a regra aceita a tradução futura
      cy.get('[data-cy="alerta-erro"]').should('be.visible').invoke('text').should('match', /digit|número/i)
      cy.get('[data-cy="menu-conta"]').should('not.exist')

      // Se a conta tivesse sido criada, este segundo cadastro falharia por e-mail repetido
      cy.registrar(nome, email, senha)
      cy.location('pathname').should('eq', '/')
      cy.get('[data-cy="menu-conta"]').should('be.visible')
    })
  })
})

describe('Login de cliente', () => {
  let email

  before(() => {
    email = emailUnico('login')
    cy.registrar('Cliente Login', email, senha)
    cy.location('pathname').should('eq', '/')
    // O cadastro já deixa o cliente logado; o login precisa começar deslogado
    cy.clearCookies()
  })

  context('Credenciais válidas', () => {
    it('CT04 - deve entrar e voltar para a página inicial', () => {
      cy.login(email, senha)

      cy.location('pathname').should('eq', '/')
      cy.get('[data-cy="menu-conta"]').should('be.visible')
    })
  })

  context('Credenciais inválidas', () => {
    it('CT05 - deve recusar senha errada', () => {
      cy.login(email, 'SenhaErrada1')

      cy.get('[data-cy="alerta-erro"]').should('contain.text', 'E-mail ou senha inválidos.')
      cy.location('pathname').should('eq', '/conta/login')
      cy.get('[data-cy="menu-conta"]').should('not.exist')
    })
  })
})
