import { pool } from './connection.js';


async function getCategoriesByUser(id){
    const rows = await pool.query(`
        SELECT * 
        from Categories
        WHERE user_id = ? 
        `, [id]);
    return rows[0];
}

async function createCategories(user_id,category_name){
    const result = await pool.query(`
        INSERT INTO Categories (user_id, category_name)
        VALUES (?,?)  
    `, [user_id, category_name]);
    // const id = result[0].insertId;
    return getCategoriesByUser(user_id);
}

export { getCategoriesByUser, createCategories }