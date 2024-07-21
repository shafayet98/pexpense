import { pool } from './connection.js';

async function createExpense(user_id, cat_id, amount){
    const result = await pool.query(`
        INSERT INTO Expenses (user_id, category_id, amount)
        VALUES (?,?,?)  
    `, [user_id, cat_id, amount]);
    // const id = result[0].insertId;
    return getExpenseDetails(user_id);
}

async function getExpenseDetails(id){
    const rows = await pool.query(`
        SELECT * 
        from Expenses
        WHERE user_id = ? 
        `, [id]);
    return rows[0];
}

async function categoryBasedSum(id){
    const rows = await pool.query(`
    SELECT 
        Categories.category_name, 
        SUM(Expenses.amount) AS total_amount 
    FROM 
        Expenses 
    INNER JOIN 
        Categories 
    ON 
        Expenses.category_id = Categories.category_id 
    WHERE 
        Expenses.user_id = ?
        AND Expenses.expense_date >= CURDATE() - INTERVAL 7 DAY 
    GROUP BY 
        Categories.category_name;
    `, [id]);
    return rows[0];
}

export { createExpense, getExpenseDetails, categoryBasedSum}