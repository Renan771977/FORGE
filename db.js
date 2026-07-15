// =============================================================================
//  db.js — Pool de Conexão Central com o MySQL (Railway)
// =============================================================================
'use strict';

const mysql = require('mysql2/promise');

// Opções que valem para os dois modos de conexão
const OPCOES_POOL = {
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  enableKeepAlive:    true,
  keepAliveInitialDelay: 10000,
};

let pool;

if (process.env.MYSQL_URL) {
  // Railway (ou .env local apontando para o banco remoto).
  // IMPORTANTE: passamos a URL *e* as opções. Antes, ao usar a URL,
  // o objeto de opções era descartado inteiro pelo `||`.
  pool = mysql.createPool({ uri: process.env.MYSQL_URL, ...OPCOES_POOL });
  console.log('[FORGE DB] Conectando via MYSQL_URL');
} else {
  pool = mysql.createPool({
    host:     process.env.MYSQLHOST     || 'localhost',
    user:     process.env.MYSQLUSER     || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQLDATABASE || 'forge',
    port:     Number(process.env.MYSQLPORT) || 3306,
    ...OPCOES_POOL,
  });
  console.log(`[FORGE DB] Conectando via variáveis avulsas (${process.env.MYSQLHOST || 'localhost'})`);
}

// =============================================================================
//  PING DE DIAGNÓSTICO
//  Roda uma vez no boot e diz em alto e bom som se o banco respondeu.
//  Sem isso, uma falha de conexão vira só um catálogo vazio na tela.
// =============================================================================
async function testarConexao() {
  try {
    const conn = await pool.getConnection();
    const [linhas] = await conn.query('SELECT DATABASE() AS db, VERSION() AS versao');
    conn.release();

    console.log(`[FORGE DB] ✅ Conectado — banco "${linhas[0].db}" | MySQL ${linhas[0].versao}`);

    // Confere se a tabela do catálogo existe de verdade
    const [tabelas] = await pool.query("SHOW TABLES LIKE 'maquinas_catalogo'");
    if (tabelas.length === 0) {
      console.warn('[FORGE DB]   A tabela "maquinas_catalogo" NÃO existe neste banco.');
    } else {
      const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM maquinas_catalogo');
      console.log(`[FORGE DB]  maquinas_catalogo: ${total} registro(s).`);
      if (total === 0) {
        console.warn('[FORGE DB]   A tabela existe mas está VAZIA — o catálogo vai aparecer vazio.');
      }
    }
    return true;
  } catch (erro) {
    console.error('[FORGE DB]  FALHA NA CONEXÃO COM O MYSQL');
    console.error(`[FORGE DB]    Código: ${erro.code || 'desconhecido'}`);
    console.error(`[FORGE DB]    Mensagem: ${erro.message}`);

    const dicas = {
      ECONNREFUSED:          'Nada escutando nesse host/porta. Rodando local sem MySQL? Aponte MYSQL_URL para o banco do Railway no .env.',
      ER_ACCESS_DENIED_ERROR:'Usuário ou senha incorretos.',
      ER_BAD_DB_ERROR:       'O banco informado não existe.',
      ENOTFOUND:             'Host não resolvido. mysql.railway.internal só funciona DENTRO do Railway — para acesso externo use a MYSQL_PUBLIC_URL.',
      ETIMEDOUT:             'Timeout. Provavelmente rede/firewall ou host interno acessado de fora.',
    };
    if (dicas[erro.code]) console.error(`[FORGE DB]    Dica: ${dicas[erro.code]}`);
    return false;
  }
}

module.exports = pool;
module.exports.testarConexao = testarConexao;