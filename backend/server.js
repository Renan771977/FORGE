// =============================================================================
//  FORGE — Performance Computing | server.js
//  Back-end REST com Express — Esqueleto de produção para Railway
// =============================================================================

'use strict';

const express = require('express');
const cors    = require('cors');
const path    = require('path');

// ── Importa os roteadores ────────────────────────────────────────────────────
const authRoutes     = require('./routes/auth');
const catalogoRoutes = require('./routes/catalogo');
const clienteRoutes  = require('./routes/cliente');

// ── Inicialização do app ─────────────────────────────────────────────────────
const app  = express();

// Railway injeta process.env.PORT automaticamente. 3000 é o fallback local.
const PORT = process.env.PORT || 3000;

// =============================================================================
//  MIDDLEWARES GLOBAIS
// =============================================================================

// CORS: em produção, substitua a origin pelo domínio real da FORGE.
// Ex: origin: 'https://forge.build'
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse de JSON no body das requisições
app.use(express.json());

// Parse de form-urlencoded (útil para formulários HTML simples)
app.use(express.urlencoded({ extended: true }));

// =============================================================================
//  ARQUIVOS ESTÁTICOS
//  O front-end (index.html, style.css, script.js) fica em /public
// =============================================================================

app.use(express.static(path.join(__dirname, 'public')));

// =============================================================================
//  ROTAS DA API
// =============================================================================

app.use('/api/auth',    authRoutes);
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

// =============================================================================
//  CATCH-ALL — SPA Fallback
//  Qualquer rota não reconhecida devolve o index.html (para o JS do front
//  resolver a navegação). Fica APÓS todas as rotas de API.
// =============================================================================

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// =============================================================================
//  HANDLER DE ERROS GLOBAL
//  Express reconhece middleware com 4 parâmetros como error handler.
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

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   FORGE API — rodando na porta ${PORT}   ║
  ║   Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(24)}║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app; // exportado para facilitar testes futuros com Jest/Supertest