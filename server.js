// =============================================================================
//  FORGE — API REST PURA | server.js
// =============================================================================
'use strict';

require('dotenv').config();

const express = require('express');
const cors    = require('cors');

const authRoutes     = require('./backend/js/auth');
const catalogoRoutes = require('./backend/js/catalogo');
const clienteRoutes  = require('./backend/js/cliente');

const app = express();
const PORT = process.env.PORT || 3000;

// =============================================================================
//  MIDDLEWARES
// =============================================================================
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =============================================================================
//  ROTAS DA API
// =============================================================================
app.use('/api/auth',     authRoutes);
app.use('/api/catalogo', catalogoRoutes);
app.use('/api/cliente',  clienteRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'FORGE API' });
});

// 404 para qualquer rota da API não encontrada
app.use((req, res) => {
  res.status(404).json({ error: true, message: 'Endpoint não encontrado.' });
});

// Handler de Erros
app.use((err, req, res, next) => {
  console.error(`[FORGE API ERROR] ${err.stack}`);
  res.status(err.statusCode || 500).json({ error: true, message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[FORGE API] Rodando 100% Desacoplada na porta ${PORT}`);
});

module.exports = app;