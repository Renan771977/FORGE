// Arquivo: middleware/auth.js
'use strict';

const jwt = require('jsonwebtoken');
// Lembre-se: Use a mesma chave secreta que usamos na rota de Login!
const JWT_SECRET = process.env.JWT_SECRET || 'forge_super_secret_key_2024';

function verificarToken(req, res, next) {
  // 1. Pega o cabeçalho de autorização da requisição
  const authHeader = req.headers['authorization'];
  
  // 2. O formato padrão é "Bearer <token>". Vamos separar para pegar só o token.
  const token = authHeader && authHeader.split(' ')[1];

  // 3. Se não tem token nenhum, bloqueia na hora (Erro 401: Unauthorized)
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token de segurança ausente.' });
  }

  // 4. Verifica se o token é válido, não foi adulterado e não expirou
  jwt.verify(token, JWT_SECRET, (err, usuarioDecodificado) => {
    if (err) {
      // Erro 403: Forbidden (O token existe, mas é inválido/falso)
      return res.status(403).json({ message: 'Sessão inválida ou expirada. Faça login novamente.' });
    }

    // 5. Sucesso! Anexa os dados do usuário na requisição e deixa a rota continuar
    req.usuario = usuarioDecodificado;
    next();
  });
}

module.exports = verificarToken;