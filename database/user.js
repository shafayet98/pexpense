
import { pool } from './connection.js';


async function getUsers(){
    const rows = await pool.query("SELECT * from Users");
    return rows[0];
}

async function getUser(id){
    const rows = await pool.query(`
        SELECT * 
        from Users
        WHERE user_id = ? 
        `, [id]);
    return rows[0];
}

async function insertUser(email,password){
    const result = await pool.query(`
        INSERT INTO Users (email, password)
        VALUES (?,?)  
    `, [email, password]);

    return result;
}


// const result = await insertUser("test02@gmail.com", "mypass02");
// console.log(result[0]);

// const rows = await getUsers();
// console.log(rows);

export { getUsers, getUser, insertUser }