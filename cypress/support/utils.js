// E-mail diferente a cada chamada, para os cadastros nunca baterem em conta já existente
export const emailUnico = (prefixo = 'cliente') =>
  `${prefixo}${Date.now()}${Cypress._.random(100, 999)}@teste.com`

// A loja formata o preço com a cultura do servidor: "R$ 299,90" em pt-BR, "R$ 299.90" em en-US.
// A expressão aceita os dois separadores para a suíte rodar em qualquer máquina.
export const moeda = (valor) => {
  const [inteiro, centavos] = valor.toFixed(2).split('.')
  return new RegExp(`R\\$\\s*${inteiro}[.,]${centavos}`)
}
