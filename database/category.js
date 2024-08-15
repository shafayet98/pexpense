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

async function getCatID(catName,user_id){
    const result = await pool.query(`
        SELECT * 
        FROM Categories
        where category_name = "${catName}" AND user_id = ${user_id}
    `);
    // console.log(result[0][0].category_id);
    return result;
}

async function deleteCategory(cat_id){
    const delete_from_expense = await pool.query(`DELETE FROM Expenses WHERE category_id = ?`,[cat_id]);
    const delete_from_category = await pool.query(`DELETE FROM Categories WHERE category_id = ?`,[cat_id]);
    return delete_from_category[0];
}



export { getCategoriesByUser, createCategories, getCatID, deleteCategory }