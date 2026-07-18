// =============================================================================
//  FORGE API | routes/cliente.js
// =============================================================================

'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../../db'); // Pool do MySQL no Railway
const verificarToken = require('../../middleware/auth'); // Middleware de segurança

// 1. GET /api/cliente/dashboard (Sua rota original protegida)
router.get('/dashboard', verificarToken, async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    const [rows] = await db.query(
      'SELECT id, nome, sobrenome, email, whatsapp, perfil_uso, criado_em FROM usuarios WHERE id = ?',
      [usuarioId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error:   true,
        message: 'Usuário não localizado no banco de dados da FORGE.',
      });
    }

    const cliente = rows[0];

    return res.status(200).json({
      success: true,
      cliente: {
        id:        cliente.id,
        nome:      `${cliente.nome} ${cliente.sobrenome}`,
        email:     cliente.email,
        whatsapp:  cliente.whatsapp,
        perfilUso: cliente.perfil_uso
      }
    });

  } catch (error) {
    next(error);
  }
});

// =============================================================================
//  POST /api/cliente/chamados
//  Salva no MySQL o chamado criado na página de Consultoria
// =============================================================================
router.post('/chamados', verificarToken, async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;
    const { assunto } = req.body;

    if (!assunto) {
      return res.status(400).json({ error: true, message: 'O assunto do chamado é obrigatório.' });
    }

    // Insere na tabela 'chamados' que você criou no seu SQL
    const [result] = await db.query(
      'INSERT INTO chamados (usuario_id, assunto, status, prioridade) VALUES (?, ?, "aberto", "normal")',
      [usuarioId, assunto]
    );

    return res.status(201).json({
      success: true,
      message: 'Chamado de consultoria registrado com sucesso!',
      ticketId: result.insertId
    });

  } catch (error) {
    next(error);
  }
});

// =============================================================================
//  GET /api/cliente/chamados
//  Busca os chamados do banco e formata exatamente como o front-end precisa
// =============================================================================
router.get('/chamados', verificarToken, async (req, res, next) => {
  try {
    const usuarioId = req.usuario.id;

    // Busca os chamados do usuário logado ordenando pelos mais recentes
    const [rows] = await db.query(
      'SELECT id, assunto, status, criado_em FROM chamados WHERE usuario_id = ? ORDER BY criado_em DESC',
      [usuarioId]
    );

    // Mapeia os estados do MySQL ('aberto', 'em_analise', 'resolvido') para o visual do Front-end
    const chamadosFormatados = rows.map(ch => {
      let statusFrontend = 'ABERTO';
      let passoVisual = 1;

      if (ch.status === 'em_analise') {
        statusFrontend = 'EM_ATENDIMENTO';
        passoVisual = 2; // Acende a etapa de "Análise" no Stepper
      } else if (ch.status === 'resolvido') {
        statusFrontend = 'RESOLVIDO';
        passoVisual = 4; // Avança tudo até "Pronto"
      }

      return {
        ticket_id: `FRG-CH-${ch.id}`,
        assunto: ch.assunto,
        status: statusFrontend,
        data_criacao: ch.criado_em,
        passoAtual: passoVisual,
        ultima_mensagem: ch.status === 'aberto' 
          ? 'Engenheiros da Forge receberam sua telemetria. Aguardando triagem.' 
          : 'Análise de escopo de hardware em andamento.',
        ultimo_autor: 'tecnico'
      };
    });

    return res.status(200).json({
      success: true,
      chamados: chamadosFormatados
    });

  } catch (error) {
    next(error);
  }
});

module.exports = router;