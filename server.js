// =============================================================================
//  FORGE — Performance Computing | server.js
//  Back-end REST com Express — Produção para Railway
// =============================================================================
'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// ── Importa os roteadores ────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const catalogoRoutes = require('./routes/catalogo');
const clienteRoutes  = require('./routes/cliente');

// ── Inicialização do app ─────────────────────────────────────────────────────
const app = express();

// Railway injeta process.env.PORT automaticamente. 3000 é o fallback local.
const PORT = process.env.PORT || 3000;

// Caminhos base do front-end
const PUBLIC_DIR = path.join(__dirname, 'public');
const HTML_DIR   = path.join(PUBLIC_DIR, 'html');

// =============================================================================
//  MIDDLEWARES GLOBAIS
// =============================================================================

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================================================
//  ARQUIVOS ESTÁTICOS (css, js, img)
//  Ex.: /css/global.css  →  public/css/global.css
//       /js/api.js       →  public/js/api.js
// =============================================================================

app.use(express.static(PUBLIC_DIR));

// =============================================================================
//  ROTAS DA API
//  IMPORTANTE: precisam vir ANTES da rota genérica '/:page',
//  caso contrário ela engoliria as chamadas da API.
// =============================================================================

app.use('/api/auth',     authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/cliente',  clienteRoutes);

// Health-check: Railway usa esse endpoint para saber se o serviço está vivo.
app.get('/api/health', (req, res) => {
  res.json({
    status:    'ok',
    service:   'FORGE API',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Qualquer rota /api/* que não existir devolve JSON (e não HTML)
app.use('/api', (req, res) => {
  res.status(404).json({ error: true, message: 'Endpoint não encontrado.' });
});

// =============================================================================
//  ROTAS DE PÁGINA (URLs limpas)
//  /            →  public/html/index.html
//  /vendas      →  public/html/vendas.html
//  /configurador→  public/html/configurador.html
// =============================================================================

app.get('/', (req, res) => {
  res.sendFile(path.join(HTML_DIR, 'index.html'));
});

app.get('/:page', (req, res, next) => {
  // Aceita tanto /vendas quanto /vendas.html
  const page = String(req.params.page).replace(/\.html$/i, '');

  // Blindagem contra path traversal (../../etc/passwd)
  if (!/^[a-z0-9_-]+$/i.test(page)) return next();

  res.sendFile(path.join(HTML_DIR, `${page}.html`), (err) => {
    if (err) next();
  });
});

// =============================================================================
//  404 GERAL
// =============================================================================

app.use((req, res) => {
  res.status(404).send('<h1>404</h1><p>Página não encontrada.</p><a href="/">Voltar para a home</a>');
});

// =============================================================================
//  HANDLER DE ERROS GLOBAL
// =============================================================================

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(`[FORGE API ERROR] ${err.stack}`);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error:   true,
    message: err.message || 'Erro interno do servidor.',
  });
});

// =============================================================================
//  START
// =============================================================================

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   FORGE API — rodando na porta ${PORT}   ║
  ║   Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(24)}║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;