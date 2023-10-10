import mysql from 'mysql2';

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: 'vicky3g',
  database: 'talent_management_db',
}).promise()

export default pool;