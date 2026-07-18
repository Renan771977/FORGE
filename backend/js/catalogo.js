// =============================================================================
//  FORGE API | routes/catalogo.js
//  Rota do catálogo de builds — Conectado ao MySQL em Produção
// =============================================================================

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../../db'); // Importa o pool do banco de dados

// =============================================================================
//  GET /api/catalogo
//  Retorna todas as máquinas cadastradas diretamente do banco
// =============================================================================
router.get('/', async (req, res, next) => {
  try {
    // Executa a consulta SQL no banco de dados
    const [rows] = await db.query('SELECT * FROM maquinas_catalogo');

    return res.status(200).json({
      success: true,
      total: rows.length,
      builds: rows,
    });
  } catch (error) {
    // Repassa qualquer falha de banco para o Error Handler global do server.js
    next(error);
  }
});

// =============================================================================
//  GET /api/catalogo/:id
//  Retorna os detalhes de uma build específica pelo ID (Slug)
// =============================================================================
router.get('/:id', async (req, res, next) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query('SELECT * FROM maquinas_catalogo WHERE id = ?', [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        error:   true,
        message: `Build com ID "${id}" não encontrada no catálogo.`,
      });
    }

    return res.status(200).json({ build: rows[0] });
  } catch (error) {
    next(error);
  }
});

module.exports = router;