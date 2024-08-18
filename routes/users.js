import express from 'express';
import { getUsers, getUser, insertUser, getUserwithEmail, updateUser } from '../database/user.js'
import { authenticateJWToken } from '../middlewares/authorization.js'
import { getCategoriesByUser, createCategories, getCatID, deleteCategory } from '../database/category.js'
import { createExpense, getExpenseDetails, categoryBasedSum, SingleCategoryExpense } from '../database/expense.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import OpenAI from 'openai';

const openai = new OpenAI();
dotenv.config();

const route_users = express.Router();

route_users.get('/', async (req, res) => {
    const users = await getUsers();
    res.send(users);
});

route_users.get('/:id', async (req, res) => {
    const id = req.params.id;
    const user = await getUser(id);
    res.send(user);
});

route_users.post('/register', async (req, res) => {
    const { email, password } = req.body.data;
    // console.log(email, password);

    // check if the user exist in db
    const existingUser = await getUserwithEmail(email);
    console.log(existingUser);
    if (existingUser.length > 0) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await insertUser(email, hashedPassword);
    res.status(201).send(user);
});

route_users.post('/login', async (req, res) => {
    const { email, password } = req.body.data;

    const usr = await getUserwithEmail(email);
    // console.log(usr[0].password);
    if (usr.length > 0) {
        const match = await bcrypt.compare(password, usr[0].password);
        if (match) {
            //login
            const user = { user_id: usr[0].user_id }
            console.log(user);
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.json({ userid: usr[0].user_id, username: usr[0].user_name, accessToken: accessToken, useremail: email });
        } else {
            res.json({ message: 'Password does not match' }).status(400);
        }
    } else {
        return res.status(400).json({ message: "User not found" });
    }

})

// expense APIs

// user creats categories
route_users.post('/categories', authenticateJWToken, async (req, res) => {

    const user = req.user_id;
    const category = req.body.data["category"];
    const categories = await createCategories(user.user_id, category);
    res.json(categories);

})
route_users.get('/categories/:id', authenticateJWToken, async (req, res) => {
    const userid = req.params.id;
    const categories = await getCategoriesByUser(userid);
    res.json(categories);
});

// user delete category
route_users.delete('/categories/:id', authenticateJWToken, async (req, res) => {
    const cat_id = req.params.id;
    // call the function that will delete the category
    const deletedRow = await deleteCategory(cat_id);
    res.json(deletedRow);
    console.log(deletedRow);
});

// Internal use APIs.

route_users.get('/category/name', authenticateJWToken, async (req, res) => {
    const user = req.user_id;
    const catName = req.query.name;
    console.log(user.user_id, catName);
    const cat_details = await getCatID(catName, user.user_id);
    console.log(cat_details[0][0].category_id)
    res.json(cat_details);
})

// user creates expense 

route_users.post('/expense', authenticateJWToken, async (req, res) => {
    const { user_id, category_id, amount } = req.body.data;
    console.log(user_id, category_id, amount);
    const expense_details = await createExpense(user_id, category_id, amount);
    res.json(expense_details);
})


// sum of categories

route_users.get('/category/sum', authenticateJWToken, async (req, res) => {
    const user = req.user_id;
    const sumbycats = await categoryBasedSum(user.user_id);
    res.json(sumbycats);
})

// settings - update username and email

route_users.post('/settings/update', authenticateJWToken, async (req, res) => {
    const { userid, username, email } = req.body.data;
    // IMPLEMENT LATER check if the email already exist in DB, if it does, send error.
    const update_user_details = await updateUser(userid, username, email);
    res.json(update_user_details);
});

route_users.get('/analyse/category/', authenticateJWToken, async (req, res) => {
    const user = req.user_id["user_id"];
    console.log(user);
    const catid = req.query.catid;
    const getsingleCategoryExpense = await SingleCategoryExpense(catid, user);
    res.json(getsingleCategoryExpense);

})

route_users.post('/ai/summary', authenticateJWToken, async (req, res) => {
    const user_id = req.user_id["user_id"];
    let expense_data = req.body.data;
    console.log(expense_data);

    let expenseDataString = JSON.stringify(expense_data);
    let prompt = `You are a personal finance analyst. Here is some expense data for a week: ${expenseDataString}. Please provide a summary in plain text format. Send the response in plain text. Do not include points. Do not include bold text or any text markup.`;

    const completion = await openai.chat.completions.create({
        messages: [{ 
            "role": "user", 
            "content": prompt }],
        model: "gpt-4o-mini",
    });
    let gpt_res = completion.choices[0].message.content;
    let ai_summary = {
        "summary": gpt_res
    }
    console.log(ai_summary);
    res.json(ai_summary);
})

route_users.post('/ai/suggestion', authenticateJWToken, async (req, res) => {
    const user_id = req.user_id["user_id"];
    let expense_data = req.body.data;
    console.log(expense_data);

    let expenseDataString = JSON.stringify(expense_data);
    let prompt = `You are a personal finance analyst. Here is some expense data for a week: ${expenseDataString}. Please provide your suggestion how user can cut their weekly expense. Please do not reponse in string.
        The response format should in JSON Object. Here is the example response format:
        [
            {
                "category": "category name 01",
                "Suggestion": "your suggestion",
                "estimated_savings": "amount"
            },
            {
                "category": "category name 02",
                "Suggestion": "your suggestion",
                "estimated_savings": "amount"
            },
        ]
    `;

    const completion = await openai.chat.completions.create({
        messages: [{ 
            "role": "user", 
            "content": prompt }],
        model: "gpt-4o-mini",
    });
    let gpt_res = completion.choices[0].message.content;
    console.log(JSON.parse(gpt_res));
    res.json(JSON.parse(gpt_res));
})

export { route_users }