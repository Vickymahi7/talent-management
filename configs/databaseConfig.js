const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  database: 'talent_management_db',
  password: 'vicky3g',
  connectionLimit: 10,
});

module.exports = pool;