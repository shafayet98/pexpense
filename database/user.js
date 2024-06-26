
import { pool } from './connection.js';

const result = await pool.query("SELECT * from Users");
console.log(result);