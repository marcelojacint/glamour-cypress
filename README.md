# Glamour Cypress: testes E2E da Glamour Perfumaria

Automação de testes ponta a ponta, feita com Cypress puro (Mocha), de duas funcionalidades da loja virtual **Glamour Perfumaria e Acessórios**.

| | |
| --- | --- |
| **Equipe** | _Integrante 1 (nome)_ · _Integrante 2 (nome)_ |
| **Disciplina** | _nome da disciplina_ |
| **Vídeo do pitch técnico** | _link do vídeo_ |

## Sistema alvo

| | |
| --- | --- |
| **Sistema** | Glamour Perfumaria e Acessórios, e-commerce de perfumes em ASP.NET Core MVC |
| **Repositório** | [marcelojacint/perfumaria-glamour](https://github.com/marcelojacint/perfumaria-glamour) |
| **URL local** | `http://localhost:5039` |

Escolhemos a Glamour porque fomos nós que desenvolvemos a loja. Conhecemos as regras de negócio pelo código e conseguimos incluir atributos `data-cy` nas telas para ter seletores estáveis.

## Funcionalidades cobertas

| Funcionalidade | Spec | Testes |
| --- | --- | --- |
| F1: Cadastro e login de cliente | `cypress/e2e/conta.cy.js` | CT01 a CT05 |
| F2: Carrinho e frete | `cypress/e2e/carrinho.cy.js` | CT06 a CT11 |

## Regras de negócio

As regras vêm do código da loja (`ContaController`, configuração do Identity, `CarrinhoController`, `FreteService` e a view do carrinho). As mensagens entre aspas são as que o sistema exibe.

**F1: Cadastro e login de cliente**

| ID | Regra |
| --- | --- |
| RN01 | Cadastro com nome, e-mail único e senha válida cria a conta de cliente e já entra logado na loja |
| RN02 | Senha e confirmação diferentes são recusadas: "As senhas não coincidem." |
| RN03 | A senha precisa ter no mínimo 8 caracteres e pelo menos 1 número |
| RN04 | O e-mail é único: não dá para cadastrar duas contas com o mesmo e-mail |
| RN05 | Login com credenciais corretas leva o cliente para a página inicial; o administrador vai para `/Admin` |
| RN06 | Login com senha errada é recusado: "E-mail ou senha inválidos." |
| RN07 | Depois de 5 senhas erradas seguidas, a conta fica bloqueada por 5 minutos: "Conta bloqueada. Aguarde alguns minutos." |

**F2: Carrinho e frete**

| ID | Regra |
| --- | --- |
| RN08 | Adicionar um produto confirma `"<Nome>" adicionado ao carrinho!` e atualiza o contador do carrinho no cabeçalho |
| RN09 | O item entra no carrinho pelo preço promocional, quando houver; senão, pelo preço normal |
| RN10 | Os botões + e − alteram a quantidade e o subtotal é recalculado |
| RN11 | Remover o item tira o produto do carrinho |
| RN12 | Subtotal abaixo de R$ 150 mostra "Faltam R$ X para frete grátis!" |
| RN13 | Subtotal a partir de R$ 150 mostra "Você ganhou frete grátis!" |
| RN14 | No checkout, a entrega em Cacimba de Dentro/PB custa R$ 4,99 abaixo de R$ 150; retirada na loja é grátis; fora da área, o cliente combina a entrega com a loja |

RN04, RN07 e RN14 ficaram fora da automação. RN04 foi verificada manualmente (ver [Bugs encontrados](#bugs-encontrados)). RN07 bloquearia a conta usada nos testes. RN14 pertence ao checkout, que não faz parte das duas funcionalidades escolhidas.

## Casos de teste

Cada caso é um bloco `it`. Os cadastros usam um e-mail novo a cada execução (`cliente<timestamp><aleatório>@teste.com`). Os testes de login usam uma conta criada no `before`, nunca a do administrador.

| CT | Funcionalidade | Cenário | Dados / passos | Resultado esperado | Regra |
| --- | --- | --- | --- | --- | --- |
| CT01 | Cadastro | Cadastrar cliente válido | Nome, e-mail único, senha `Teste1234` nas duas caixas | Volta para a página inicial já logado (ícone da conta visível no cabeçalho) | RN01 |
| CT02 | Cadastro | Senhas diferentes | Senha `Teste1234`, confirmação `Teste9999` | "As senhas não coincidem." e continua em `/conta/registrar` | RN02 |
| CT03 | Cadastro | Senha sem número | Senha `abcdefgh` nas duas caixas; depois, novo cadastro com o mesmo e-mail e senha válida | Erro de senha exibido; o segundo cadastro passa, provando que a primeira conta não foi criada | RN03 |
| CT04 | Login | Login válido | Conta criada no `before` | Redireciona para a página inicial logado | RN05 |
| CT05 | Login | Senha errada | Conta do `before` + `SenhaErrada1` | "E-mail ou senha inválidos." e continua em `/conta/login` | RN06 |
| CT06 | Carrinho | Adicionar produto | `/produto/black-opium` → Adicionar ao Carrinho | Resposta `"Black Opium" adicionado ao carrinho!`, aviso "Adicionado ao carrinho!" na tela e contador do cabeçalho em `1` | RN08 |
| CT07 | Carrinho | Preço promocional | `la-vie-est-belle` (de R$ 389,90 por R$ 299,90) | Item no carrinho por R$ 299,90, não por R$ 389,90 | RN09 |
| CT08 | Carrinho | Aumentar quantidade | Black Opium (R$ 459,90) e clicar em + | Quantidade `2` e subtotal R$ 919,80 | RN10 |
| CT09 | Carrinho | Remover item | Adicionar Black Opium e clicar em Remover | Item some, aparece "Seu carrinho está vazio." e o contador some | RN11 |
| CT10 | Carrinho | Frete grátis | Bombshell (R$ 159,90 na promoção, o item mais barato acima do limite) | "Você ganhou frete grátis!" | RN13 |
| CT11 | Carrinho | Falta para frete grátis | Miniatura La Vie Est Belle (R$ 89,90) | "Faltam R$ 60,10 para frete grátis!" | RN12 |

Resultado da última execução de `npm run cy:run`: **11 passing**.

## Bugs encontrados

Achamos três bugs ao levantar as regras e reproduzimos cada um com a loja rodando localmente:

| # | Bug | Como reproduzir | Esperado | Obtido |
| --- | --- | --- | --- | --- |
| B01 | Mensagens de cadastro em inglês | Cadastrar com senha `abcdefgh`, ou com um e-mail que já existe | Mensagens em português | "Passwords must have at least one digit ('0'-'9')."; para e-mail repetido, duas mensagens: "Username '…' is already taken." e "Email '…' is already taken." |
| B02 | Validador de cadastro não é executado | Cadastrar com telefone `123` | "Telefone inválido." | A conta é criada com o telefone `123`. O `RegistrarUsuarioValidator` está registrado, mas o `ContaController` não o chama, por isso "Nome é obrigatório." e "Telefone inválido." nunca aparecem |
| B03 | Nome só com espaços derruba o cadastro | Preencher o nome com espaços (o `required` do HTML aceita) e enviar | Mensagem pedindo o nome | Erro HTTP 500. O ASP.NET transforma o texto em branco em `null` e o banco recusa: `null value in column "Nome"` |

O CT03 aceita tanto a mensagem atual em inglês quanto uma futura tradução (`/digit|número/i`). Assim ele continua passando quando o B01 for corrigido.

## Tecnologias

- **Testes:** Cypress 16, Mocha (`describe`, `context`, `it`), Node.js
- **Sistema testado:** ASP.NET Core MVC (.NET 10), PostgreSQL, Redis e Alpine.js

## Estrutura do projeto

```
glamour-cypress/
├── cypress/
│   ├── e2e/
│   │   ├── conta.cy.js          # CT01–CT05
│   │   └── carrinho.cy.js       # CT06–CT11
│   ├── fixtures/
│   │   └── produtos.json        # slugs e preços dos produtos usados
│   └── support/
│       ├── commands.js          # cy.registrar(), cy.login(), cy.adicionarAoCarrinho()
│       ├── e2e.js               # aceita o aviso de cookies e desliga o service worker
│       └── utils.js             # emailUnico() e moeda()
├── cypress.config.js            # baseUrl: http://localhost:5039
├── cypress.env.example.json     # modelo, sem senha
└── package.json                 # scripts cy:open e cy:run
```

## Como rodar localmente

### 1. Pré-requisitos

- [Node.js](https://nodejs.org/) 22 ou superior (exigido pelo Cypress 16)
- [.NET SDK 10](https://dotnet.microsoft.com/download)
- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)
- Google Chrome (usado pelo `npm run cy:run`)
- Internet: a loja carrega o Alpine.js por CDN, e sem ele o botão de adicionar ao carrinho não funciona

### 2. Subir a loja

```bash
git clone https://github.com/marcelojacint/perfumaria-glamour.git
cd perfumaria-glamour
docker compose up -d postgres redis
dotnet run --project src/Glamour.Web
```

Abra `http://localhost:5039` e confira se a vitrine aparece com os produtos. Na primeira execução a loja cria o banco e os produtos de demonstração, entre eles a Miniatura La Vie Est Belle usada no CT11.

### 3. Preparar os testes

Com a loja no ar, em outro terminal:

```bash
git clone https://github.com/marcelojacint/glamour-cypress.git
cd glamour-cypress
npm install
cp cypress.env.example.json cypress.env.json
```

O `cypress.env.json` fica fora do Git e serve para guardar credenciais locais, como a do administrador. Os testes atuais não usam nenhuma, então o arquivo pode ficar como foi copiado.

### 4. Rodar

```bash
npm run cy:open   # interface gráfica do Cypress
npm run cy:run    # headless no terminal, com o resumo de passou/falhou
```

O `cy:run` usa o Chrome headless. Para rodar no Electron que vem com o Cypress, use `npx cypress run`. No Linux com Wayland o Electron headless não desenha a tela, e as animações da loja (o aviso de "Adicionado ao carrinho!") nunca terminam. Nesse caso, rode assim:

```bash
ELECTRON_EXTRA_LAUNCH_ARGS=--ozone-platform=x11 npx cypress run
```

### Cuidados

- **Limite de login:** a loja aceita 10 tentativas de login a cada 5 minutos, somando todos os usuários. Cada execução completa gasta 2, então evite rodar a suíte mais de 5 vezes em 5 minutos.
- **Contas de teste:** cada execução cria 3 contas `@teste.com` no banco local.
- **Isolamento:** o carrinho fica no Redis, ligado ao cookie de sessão. O Cypress limpa os cookies entre os testes, então cada `it` começa com o carrinho vazio.

## Boas práticas adotadas

- **Sem espera fixa:** nenhum `cy.wait(<ms>)`. As verificações usam o retry do `.should()`. Onde a tela depende de uma requisição, usamos `cy.intercept()` + `cy.wait('@alias')`.
- **Seletores estáveis:** atributos `data-cy` adicionados nas views da loja. A única exceção é o contador do carrinho, que já tinha `id="badge-carrinho"`. Nada de XPath nem de texto genérico.
- **Comandos customizados:** `cy.registrar()`, `cy.login()` e `cy.adicionarAoCarrinho()` deixam as specs curtas e legíveis.
- **Dados únicos por execução:** e-mails gerados com timestamp, para a suíte rodar quantas vezes for preciso sem conflito.
- **Fixtures:** slugs e preços em `cypress/fixtures/produtos.json`, e não espalhados pelas specs.
- **Credenciais fora do Git:** `cypress.env.json` está no `.gitignore` e a senha do administrador não aparece no repositório.
- **Independente da cultura do servidor:** o helper `moeda()` aceita `R$ 299,90` e `R$ 299.90`, porque a loja formata o preço com a cultura da máquina onde roda.
