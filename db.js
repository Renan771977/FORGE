// db.js - Pool de Conexão Central com o MySQL no Railway
'use strict';

const mysql = require('mysql2/promise');

// O Railway injeta automaticamente variáveis de ambiente quando os serviços estão conectados.
// Se rodar localmente, ele usará a string de conexão ou os fallbacks.
const pool = mysql.createPool(process.env.MYSQL_URL || {
  host: process.env.MYSQLHOST || 'localhost',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || '',
  database: process.env.MYSQLDATABASE || 'forge',
  port: process.env.MYSQLPORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;