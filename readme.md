<div align="center">

# ⚡ FORGE — Performance Computing

**Workstations e PCs gamer montados com precisão técnica.
Performance garantida por benchmark, não por promessa.**

##  Sumário

- [Objetivo](#-objetivo)
- [Demonstração](#-demonstração)
- [Funcionalidades](#-funcionalidades)
- [Stack de Tecnologias](#-stack-de-tecnologias)
- [Arquitetura](#-arquitetura)
- [API REST](#-api-rest)
- [Modelo de Dados](#-modelo-de-dados)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Como Rodar Localmente](#-como-rodar-localmente)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Deploy](#-deploy)
- [Segurança](#-segurança)
- [Roadmap](#-roadmap)

---

##  Objetivo

A **FORGE** é uma loja virtual especializada em computadores de alta performance —
workstations para IA, 3D e desenvolvimento, além de PCs gamer. O diferencial da
marca é vender máquinas cuja performance é **comprovada por benchmark**, e o site
foi construído para colocar essa proposta no centro da experiência.

O projeto entrega uma jornada de e-commerce completa: o cliente explora o catálogo,
usa um configurador inteligente para receber recomendações, compara máquinas por
telemetria real, monta um carrinho, finaliza a compra em um checkout de varejo e
acompanha o pedido — da triagem ao benchmark — em um painel pessoal.

Tecnicamente, o objetivo foi construir um sistema **distribuído e desacoplado**,
seguindo o estilo arquitetural **REST**: front-end e back-end são serviços
independentes que se comunicam por HTTP trocando JSON.

---

## 🖥️ Demonstração

| Página | Descrição |
|--------|-----------|
| **Home** | Apresentação da marca e destaques |
| **Catálogo** | 34 builds reais do banco, com filtros por uso, cor e preço |
| **Configurador** | Quiz de 4 perguntas que recomenda builds por pontuação |
| **Benchmark** | Comparador de duas máquinas com análise de custo-benefício |
| **Produto** | Ficha técnica completa: specs, telemetria e estoque em tempo real |
| **Carrinho / Checkout** | Fluxo de compra em 3 etapas no padrão de varejo |
| **Laboratório VIP** | Painel do cliente com pedidos, vitrine e parceiras |

---

##  Funcionalidades

### Loja
- **Catálogo dinâmico** — as 34 builds vêm do MySQL, não são hardcoded.
- **Filtros combinados** — por perfil de uso, cor da build e faixa de preço.
- **Página de produto** — cada build tem URL própria (`/produto?id=`), com specs
  detalhadas (do JSON `specs`), telemetria de benchmarks e status de estoque
  (pronta entrega / últimas unidades / esgotado).

### Configurador inteligente
- Quiz de 4 perguntas (uso, orçamento, prioridade, prazo).
- Motor de **pontuação** que rankeia as builds do catálogo e justifica cada
  recomendação ("dentro do orçamento · perfil compatível · GPU dedicada").

### Benchmark Lab
- Comparador de duas máquinas em três métricas (Cinebench, 3DMark, FPS).
- **Análise de eficiência e custo-benefício** gerada por motor de regras a partir
  dos números reais: quem lidera, diferença de preço, pontos de render por real
  investido e delta térmico.

### Conta e pedidos
- Cadastro e login com **JWT**, incluindo login social via Google.
- **Laboratório VIP**: painel do cliente protegido, sincronizado com o servidor.
- Carrinho persistente e **checkout de 3 etapas** (Entrega → Pagamento → Revisão)
  com busca de CEP, máscaras e validação.
- Acompanhamento de pedido por **timeline de status**:
  `Pagamento → Triagem → Montagem → Benchmark → Entrega`.

---

## 🛠️ Stack de Tecnologias

### Back-end
| Tecnologia | Uso |
|------------|-----|
| **Node.js** | Runtime JavaScript |
| **Express 4** | Framework HTTP / roteamento da API |
| **MySQL 9** (`mysql2`) | Banco de dados relacional |
| **jsonwebtoken** | Autenticação stateless via JWT |
| **bcrypt** | Hash de senhas |
| **google-auth-library** | Login social com Google |
| **cors** | Controle de origem cruzada |
| **dotenv** | Variáveis de ambiente |

### Front-end
| Tecnologia | Uso |
|------------|-----|
| **HTML5 / CSS3** | Estrutura e estilo (CSS puro, sem framework) |
| **JavaScript (ES6+)** | Lógica das páginas, consumo da API via `fetch` |
| **serve** | Servidor de arquivos estáticos em produção |

### Infraestrutura
| Tecnologia | Uso |
|------------|-----|
| **Railway** | Hospedagem dos serviços (front, back e MySQL) |
| **Git / GitHub** | Versionamento e deploy contínuo |

---

##  Arquitetura

O sistema segue o estilo **REST**, com front-end e back-end como **serviços
distribuídos e independentes** que se comunicam por HTTP trocando JSON.

```
┌─────────────────┐        HTTP / JSON        ┌─────────────────┐
│   FRONT-END     │  ───────────────────────► │    BACK-END     │
│                 │                            │                 │
│  serve          │   GET/POST/PUT/DELETE      │  Express (API)  │
│  HTML/CSS/JS    │  ◄─────────────────────    │                 │
│                 │        respostas JSON      │                 │
└─────────────────┘                            └────────┬────────┘
   forge-frontend                                       │
   (telas)                                               │ SQL
                                                ┌────────▼────────┐
                                                │     MySQL       │
                                                │  (Railway)      │
                                                └─────────────────┘
```

### Organização interna (MVC)

Dentro do back-end, o código segue o padrão **MVC**. Vale reforçar: **MVC e REST
não competem** — MVC descreve como o código se organiza dentro do servidor; REST
descreve como os sistemas conversam pela rede. Uma API REST é normalmente escrita
em MVC, e é o caso aqui.

| Camada | Responsabilidade | Onde |
|--------|------------------|------|
| **Model** | Acesso a dados | `db.js` (pool MySQL) + tabelas |
| **Controller** | Lógica das rotas | `backend/js/*.js` |
| **View** | Resposta ao cliente | JSON retornado pela API |
| **Middleware** | Validação de token | `middleware/auth.js` |

O front-end é um **cliente** que consome essa API — ele não tem lógica de
negócio nem acesso direto ao banco.

---

## 🔌 API REST

Base URL: `/api`

Todas as rotas retornam **JSON** e usam os **métodos HTTP** conforme a operação.

### Autenticação — `/api/auth`
| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/auth/register` | Cria uma nova conta |
| `POST` | `/api/auth/login` | Autentica e devolve o token JWT |
| `POST` | `/api/auth/google` | Login social com Google |

### Catálogo — `/api/catalogo`
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/catalogo` | Lista todas as builds |
| `GET` | `/api/catalogo/:id` | Detalha uma build específica |

### Cliente — `/api/cliente` *(rotas protegidas por JWT)*
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/cliente/dashboard` | Dados do usuário autenticado |
| `GET` | `/api/cliente/chamados` | Lista os chamados do cliente |
| `POST`| `/api/cliente/chamados` | Abre um novo chamado |

### Utilidade
| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/api/health` | Health-check do serviço |

> **Autenticação:** rotas protegidas exigem o header
> `Authorization: Bearer <token>`. O middleware devolve **401** quando o token
> está ausente e **403** quando é inválido ou expirou.

---

##  Modelo de Dados

Banco **MySQL** com as seguintes tabelas principais:

| Tabela | Descrição |
|--------|-----------|
| `usuarios` | Contas dos clientes (nome, email, senha hasheada, perfil) |
| `maquinas_catalogo` | As builds à venda — `specs` e `benchmarks` são colunas **JSON** |
| `chamados` | Tickets de suporte abertos pelos clientes |
| `pedidos` | Pedidos de compra |
| `projetos_salvos` | Wishlist / configurações salvas |
| `setups_clientes` | Setups analisados pelos clientes |
| `admins` | Contas administrativas |

**Exemplo de registro em `maquinas_catalogo`:**
```json
{
  "id": "business-pro",
  "nome": "FORGE Business Pro",
  "preco": "R$ 3.500",
  "badge": "OFFICE",
  "render_class": "black",
  "specs": { "cpu": "AMD Ryzen 5 8600G", "gpu": "Radeon 760M", "ram": "16GB DDR5" },
  "benchmarks": { "cinebench": "14600", "fps": "60 FPS", "temp": "71°C" },
  "estoque": 5
}
```

---

##  Estrutura de Pastas

```
FORGE/
├── server.js                 # inicializa o Express (API pura)
├── db.js                     # Model: pool de conexão MySQL
├── package.json              # dependências do back-end
│
├── backend/
│   └── js/                   # Controllers (rotas REST)
│       ├── auth.js
│       ├── catalogo.js
│       └── cliente.js
│
├── middleware/
│   └── auth.js               # validação do token JWT
│
└── frontend/                 # serviço separado (telas)
    ├── package.json          # dependências do front (serve)
    ├── serve.json            # rewrites de URL (rotas limpas)
    ├── index.html            # redirect para /html/index.html
    ├── css/                  # estilos (planos, sem subpastas)
    ├── js/                   # scripts das páginas + api.js/global.js
    ├── html/                 # as páginas
    └── img/                  # imagens das builds
```

> **Nota:** front e back são serviços **separados** no Railway. Cada um tem seu
> próprio `package.json`. O front serve arquivos estáticos; o back expõe a API.

---

##  Como Rodar Localmente

### Pré-requisitos
- Node.js 18 ou superior
- Uma instância MySQL (local ou a do Railway via URL pública)

### Back-end
```bash
# na raiz do projeto
npm install

# crie o arquivo .env (veja a seção abaixo)

npm run dev      # inicia com nodemon
# ou
npm start        # node server.js
```
O back sobe em `http://localhost:3000`. Teste com `http://localhost:3000/api/health`.

### Front-end
```bash
cd frontend
npm install
npm run dev      # serve na porta 3000
```
Abra `http://localhost:3000`.

> **Dica:** depois de mover qualquer arquivo `.js` do back, rode `node server.js`
> **antes** de dar `git push`. Se subir localmente, sobe no Railway.

---

##  Variáveis de Ambiente

Crie um arquivo `.env` na raiz (nunca versione — já está no `.gitignore`):

```env
# Banco de dados
MYSQL_URL=mysql://usuario:senha@host:porta/railway

# Autenticação
JWT_SECRET=uma_chave_longa_secreta_e_aleatoria

# Google OAuth (login social)
GOOGLE_CLIENT_ID=seu_client_id.apps.googleusercontent.com

# Ambiente
NODE_ENV=development
```

| Variável | Descrição |
|----------|-----------|
| `MYSQL_URL` | String de conexão do MySQL. Local: use a URL **pública** do Railway. Em produção: a URL **interna** (`mysql.railway.internal`). |
| `JWT_SECRET` | Segredo para assinar os tokens. **Obrigatório em produção.** |
| `GOOGLE_CLIENT_ID` | ID do cliente OAuth para login com Google |
| `NODE_ENV` | `development` ou `production` |

---

## Deploy

Hospedado no **Railway**, com três serviços:

| Serviço | Papel | Root Directory |
|---------|-------|----------------|
| **FORGE** | Back-end (API Express) | *(raiz do repo)* |
| **FORGE-FRONTEND** | Front-end (`serve`) | `frontend` |
| **MySQL** | Banco de dados | — |

O deploy é contínuo: cada `git push` na branch `main` dispara um novo build.

**Comunicação entre serviços em produção:**
- O back usa a `MYSQL_URL` **interna** do Railway (`mysql.railway.internal`),
  mais rápida e sem expor o banco à internet.
- O front consome o back pela URL **pública** da API, configurada em
  `frontend/js/api.js`.

---

##  Segurança

- **Senhas** são armazenadas com hash **bcrypt**, nunca em texto puro.
- **Autenticação stateless** via JWT; rotas sensíveis passam pelo middleware
  `verificarToken`.
- A validação de sessão é feita **no servidor** — o front não confia apenas no
  `localStorage`.
- Dados sensíveis (senhas, número completo de cartão, CVV) **não são persistidos**
  no navegador; o checkout guarda apenas os 4 últimos dígitos do cartão.
- Segredos ficam em **variáveis de ambiente**, fora do código versionado.

>  **Importante:** em produção, `JWT_SECRET` e `GOOGLE_CLIENT_ID` devem ser
> definidos como variáveis de ambiente no Railway. Nunca confie nos valores de
> fallback do código.

---

## 🗺️ Roadmap

Funcionalidades planejadas para completar o CRUD REST de ponta a ponta:

- [ ] **Recurso Pedidos na API** — mover o carrinho/checkout do `localStorage`
      para a tabela `pedidos`, com os métodos que faltam:
  - `POST /api/cliente/pedidos` — criar pedido
  - `GET /api/cliente/pedidos` — listar pedidos do cliente
  - `PUT /api/cliente/pedidos/:id` — atualizar status
  - `DELETE /api/cliente/pedidos/:id` — cancelar pedido
- [ ] Painel administrativo para gerenciar catálogo e pedidos
- [ ] Integração real de pagamento (PIX / cartão)
- [ ] Notificações de mudança de status do pedido

---

<div align="center">

**FORGE — Performance Computing**
Belo Horizonte, MG · Brasil

*Construído para o máximo.*

</div>