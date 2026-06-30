// =============================================================================
//  FORGE API | routes/auth.js
//  Rotas de autenticação: login e cadastro
//  TODO: substituir dados mockados por consultas reais ao banco (Supabase/PG)
// =============================================================================

'use strict';

const express = require('express');
const router  = express.Router();

// ── Dados mockados (remover quando integrar banco de dados) ──────────────────
const MOCK_USERS = [
  {
    id:       'usr-001',
    nome:     'Renan Alves',
    email:    'renan@forge.build',
    senha:    '12345678',           // ⚠️ Em produção: use bcrypt.compare()
    perfil:   'Desenvolvedor de Software',
    buildId:  'FRG-2025-0094',
  },
];

// =============================================================================
//  POST /api/auth/login
//  Body: { email: string, senha: string }
// =============================================================================

router.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // Validação básica de campos obrigatórios
  if (!email || !senha) {
    return res.status(400).json({
      error:   true,
      message: 'E-mail e senha são obrigatórios.',
    });
  }

  // TODO: substituir por query real ao banco
  // Exemplo Supabase: const { data, error } = await supabase.auth.signInWithPassword(...)
  const usuario = MOCK_USERS.find(
    u => u.email === email && u.senha === senha,
  );

  if (!usuario) {
    return res.status(401).json({
      error:   true,
      message: 'Credenciais inválidas. Verifique seu e-mail e senha.',
    });
  }

  // TODO: gerar JWT real com jsonwebtoken
  // const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  return res.status(200).json({
    message: 'Login realizado com sucesso.',
    token:   'mock-jwt-token-forge-2025',   // substituir por JWT real
    usuario: {
      id:      usuario.id,
      nome:    usuario.nome,
      email:   usuario.email,
      perfil:  usuario.perfil,
      buildId: usuario.buildId,
    },
  });
});

// =============================================================================
//  POST /api/auth/register
//  Body: { nome, sobrenome, email, telefone, perfil, senha }
// =============================================================================

router.post('/register', (req, res) => {
  const { nome, sobrenome, email, telefone, perfil, senha } = req.body;

  // Validação de campos obrigatórios
  if (!nome || !email || !senha) {
    return res.status(400).json({
      error:   true,
      message: 'Nome, e-mail e senha são obrigatórios.',
    });
  }

  // Validação de senha mínima
  if (senha.length < 8) {
    return res.status(400).json({
      error:   true,
      message: 'A senha deve ter no mínimo 8 caracteres.',
    });
  }

  // TODO: verificar se email já existe no banco
  const emailJaCadastrado = MOCK_USERS.some(u => u.email === email);
  if (emailJaCadastrado) {
    return res.status(409).json({
      error:   true,
      message: 'Este e-mail já está cadastrado.',
    });
  }

  // TODO: hash da senha com bcrypt antes de salvar
  // const senhaHash = await bcrypt.hash(senha, 10);

  // TODO: inserir usuário no banco (Supabase/PostgreSQL)
  const novoUsuario = {
    id:       `usr-${Date.now()}`,
    nome:     `${nome} ${sobrenome || ''}`.trim(),
    email,
    telefone: telefone || null,
    perfil:   perfil   || null,
    buildId:  null,             // preenchido após primeira compra
    criadoEm: new Date().toISOString(),
  };

  return res.status(201).json({
    message: 'Conta criada com sucesso.',
    usuario: novoUsuario,
  });
});

module.exports = router;