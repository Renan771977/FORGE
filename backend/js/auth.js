'use strict';

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../../db'); 
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '969924296460-7c3nctb35bodtgfjnekv28du6jfn0tit.apps.googleusercontent.com';
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

// Chave secreta para assinar o "crachá" do usuário (Em produção, coloque isso no .env)
const JWT_SECRET = process.env.JWT_SECRET || 'forge_super_secret_key_2024';

// =============================================================================
//  POST /api/auth/register
//  Recebe os dados do formulário, criptografa a senha e salva o cliente
// =============================================================================
router.post('/register', async (req, res, next) => {
  try {
    // 1. Extrai exatamente os campos que estão no seu layout
    const { nome, sobrenome, email, whatsapp, perfil_uso, senha } = req.body;

    // 2. Validação básica de segurança
    if (!nome || !sobrenome || !email || !whatsapp || !perfil_uso || !senha) {
      return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    if (senha.length < 8) {
      return res.status(400).json({ message: 'A senha deve ter no mínimo 8 caracteres.' });
    }

    // 3. Verifica se o e-mail já existe no banco
    const [existingUser] = await db.query('SELECT id FROM usuarios WHERE email = ?', [email]);
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'Este e-mail já está cadastrado.' });
    }

    // 4. Criptografa a senha com bcrypt (NUNCA salvamos a senha real)
    const saltRounds = 10;
    const senhaHash = await bcrypt.hash(senha, saltRounds);

    // 5. Salva o novo cliente no banco de dados
    const [result] = await db.query(
      'INSERT INTO usuarios (nome, sobrenome, email, whatsapp, perfil_uso, senha) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, sobrenome, email, whatsapp, perfil_uso, senhaHash]
    );

    // 6. Gera o token de acesso (login automático após cadastro)
    const token = jwt.sign({ id: result.insertId, email: email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(201).json({
      message: 'Conta criada com sucesso!',
      token: token,
      usuario: {
        id: result.insertId,
        nome: nome,
        email: email
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

// =============================================================================
//  POST /api/auth/login
//  Verifica credenciais, compara a senha criptografada e gera o token
// =============================================================================
router.post('/login', async (req, res, next) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ message: 'Preencha e-mail e senha.' });
    }

    // 1. Busca o usuário pelo e-mail
    const [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    if (usuarios.length === 0) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    const usuario = usuarios[0];

    // 2. Compara a senha digitada com a senha embaralhada no banco
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ message: 'E-mail ou senha incorretos.' });
    }

    // 3. Gera o crachá (Token)
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      message: 'Bem-vindo de volta!',
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        perfil_uso: usuario.perfil_uso // Trazemos o perfil para calcular os gargalos depois
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro interno no servidor.' });
  }
});

module.exports = router;

// =============================================================================
//  POST /api/auth/google
//  Recebe a credencial do Google, valida, e faz Login ou Cadastro automático
// =============================================================================
router.post('/google', async (req, res, next) => {
  try {
    const { credential } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: 'Credencial do Google ausente.' });
    }

    // 1. Bate na porta do Google e verifica se o token é original e não foi fraudado
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    
    // 2. Extrai os dados validados do cliente (O Google garante que o e-mail é real)
    const payload = ticket.getPayload();
    const { email, given_name, family_name } = payload;

    // 3. Verifica se esse cliente já existe na nossa base FORGE
    let [usuarios] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    let usuario = usuarios[0];

    // 4. Se o cliente for novo, a FORGE cria uma conta para ele NA HORA (Fricção Zero)
    if (!usuario) {
      // Como ele loga com o Google, geramos uma senha aleatória criptografada complexa pro banco
      const randomPassword = await bcrypt.hash(Math.random().toString(36).slice(-12), 10);
      
      const [result] = await db.query(
        'INSERT INTO usuarios (nome, sobrenome, email, whatsapp, perfil_uso, senha) VALUES (?, ?, ?, ?, ?, ?)',
        [given_name || 'Usuário', family_name || '', email, '', 'Explorador', randomPassword]
      );

      // Puxa o usuário recém-criado
      const [newUsers] = await db.query('SELECT * FROM usuarios WHERE id = ?', [result.insertId]);
      usuario = newUsers[0];
    }

    // 5. Gera o NOSSO Crachá (Token JWT da FORGE) igualzinho no Login tradicional
    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '7d' });

    // 6. Devolve os dados e libera a entrada VIP!
    return res.status(200).json({
      message: 'Autenticação Google bem-sucedida!',
      token: token,
      usuario: {
        id: usuario.id,
        nome: `${usuario.nome} ${usuario.sobrenome}`.trim(),
        email: usuario.email,
        perfil_uso: usuario.perfil_uso
      }
    });

  } catch (error) {
    console.error('Erro de segurança no Login via Google:', error);
    res.status(401).json({ message: 'Sessão do Google inválida ou expirada.' });
  }
});