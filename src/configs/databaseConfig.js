const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  // host: '',
  // user: 'root',
  // database: '',
  // password: '',
  // connectionLimit: 10,
});

module.exports = pool;
