// =============================================================================
//  FORGE — Performance Computing | server.js
//  Back-end REST com Express — Produção para Railway
// =============================================================================
require('dotenv').config();

'use strict';

const express = require('express');
const cors    = require('cors');

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

// CORS: Essencial para o GitHub Pages conseguir acessar a API no Railway
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse de JSON no body das requisições
app.use(express.json());

// Parse de form-urlencoded
app.use(express.urlencoded({ extended: true }));

// =============================================================================
//  ROTAS DA API
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

// O segredo do Railway: '0.0.0.0' obriga o Express a abrir as portas
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   FORGE API — rodando na porta ${PORT}   ║
  ║   Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(24)}║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;