// =============================================================================
//  FORGE — Performance Computing | server.js
//  Back-end REST com Express — Esqueleto de produção para Railway
// =============================================================================
require('dotenv').config();

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

// Middleware para proteger as rotas do Cliente
async function autenticarCliente(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ erro: 'Token de autenticação não fornecido.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decodificado = jwt.verify(token, JWT_SECRET);
    req.usuario = decodificado; // Insere os dados do cliente na requisição
    next();
  } catch (err) {
    return res.status(403).json({ erro: 'Sessão expirada ou Token inválido.' });
  }
}

// CORREÇÃO NO BACKEND: Envelopar o array para o plugin do Claude conseguir ler
app.get('/api/cliente/chamados', autenticarCliente, async (req, res, next) => {
    try {
        const [rows] = await pool.query(
            'SELECT ticket_id, assunto, status, data_criacao FROM chamados WHERE cliente_email = ? ORDER BY data_criacao DESC',
            [req.usuario.email]
        );
        
        // Em vez de res.json(rows), envie assim:
        res.json({ chamados: rows });
        
    } catch(err) {
        console.error(err);
        res.status(500).json({erro: "Erro ao buscar chamados"});
    }
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

// O segredo do Railway: adicionar o '0.0.0.0' obriga o Express a abrir 
// as portas para a rede externa do container!
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║   FORGE API — rodando na porta ${PORT}   ║
  ║   Ambiente: ${(process.env.NODE_ENV || 'development').padEnd(24)}║
  ╚══════════════════════════════════════╝
  `);
});

module.exports = app;

module.exports = app; // exportado para facilitar testes futuros com Jest/Supertest