import { moeda } from '../support/utils'

const LIMITE_FRETE_GRATIS = 150

describe('Carrinho e frete', () => {
  let produtos

  before(() => {
    cy.fixture('produtos').then((dados) => {
      produtos = dados
    })
  })

  context('Adicionar ao carrinho', () => {
    it('CT06 - deve adicionar o produto e atualizar o contador do cabeçalho', () => {
      const { slug, nome } = produtos.blackOpium

      cy.adicionarAoCarrinho(slug)
        .its('response.body.mensagem')
        .should('eq', `"${nome}" adicionado ao carrinho!`)

      cy.get('[data-cy="alerta-sucesso"]').should('be.visible').and('contain.text', 'Adicionado ao carrinho!')
      cy.get('#badge-carrinho').should('be.visible').and('have.text', '1')
    })

    it('CT07 - deve usar o preço promocional quando houver', () => {
      const { slug, nome, preco, precoPromo } = produtos.laVieEstBelle

      cy.adicionarAoCarrinho(slug)
      cy.get('[data-cy="link-carrinho"]').click()

      cy.get('[data-cy="carrinho-item"]').should('have.length', 1)
      cy.get('[data-cy="item-nome"]').should('have.text', nome)
      cy.get('[data-cy="item-preco"]').invoke('text').should('match', moeda(precoPromo))
      cy.get('[data-cy="item-preco"]').invoke('text').should('not.match', moeda(preco))
    })
  })

  context('Alterar o carrinho', () => {
    it('CT08 - deve aumentar a quantidade e recalcular o subtotal', () => {
      const { slug, preco } = produtos.blackOpium

      cy.adicionarAoCarrinho(slug)
      cy.get('[data-cy="link-carrinho"]').click()
      cy.get('[data-cy="item-quantidade"]').should('have.text', '1')

      cy.get('[data-cy="item-mais"]').click()

      cy.get('[data-cy="item-quantidade"]').should('have.text', '2')
      cy.get('[data-cy="carrinho-subtotal"]').invoke('text').should('match', moeda(preco * 2))
    })

    it('CT09 - deve remover o item e deixar o carrinho vazio', () => {
      const { slug } = produtos.blackOpium

      cy.adicionarAoCarrinho(slug)
      cy.get('[data-cy="link-carrinho"]').click()
      cy.get('[data-cy="carrinho-item"]').should('have.length', 1)

      cy.get('[data-cy="item-remover"]').click()

      cy.get('[data-cy="carrinho-item"]').should('not.exist')
      cy.get('[data-cy="carrinho-vazio"]').should('be.visible').and('contain.text', 'Seu carrinho está vazio.')
      cy.get('#badge-carrinho').should('not.be.visible')
    })
  })

  context('Frete grátis', () => {
    it('CT10 - deve dar frete grátis a partir de R$ 150', () => {
      // Bombshell é o item mais barato acima do limite: R$ 159,90 na promoção
      cy.adicionarAoCarrinho(produtos.bombshell.slug)
      cy.get('[data-cy="link-carrinho"]').click()

      cy.get('[data-cy="frete-gratis"]').should('be.visible').and('contain.text', 'Você ganhou frete grátis!')
      cy.get('[data-cy="frete-falta"]').should('not.exist')
    })

    it('CT11 - deve mostrar quanto falta para o frete grátis abaixo de R$ 150', () => {
      const { slug, preco } = produtos.miniatura
      const falta = moeda(LIMITE_FRETE_GRATIS - preco)

      cy.adicionarAoCarrinho(slug)
      cy.get('[data-cy="link-carrinho"]').click()

      cy.get('[data-cy="frete-falta"]')
        .should('be.visible')
        .invoke('text')
        .should('match', new RegExp(`Faltam ${falta.source} para frete grátis!`))
      cy.get('[data-cy="frete-gratis"]').should('not.exist')
    })
  })
})
