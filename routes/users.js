import express from 'express';
import { getUsers, getUser, insertUser, getUserwithEmail} from '../database/user.js'
import { authenticateJWToken } from '../middlewares/authorization.js'
import { getCategoriesByUser, createCategories, getCatID} from '../database/category.js'
import { createExpense, getExpenseDetails, categoryBasedSum} from '../database/expense.js'
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const route_users = express.Router();

route_users.get('/', async (req, res)=>{
    const users = await getUsers();
    res.send(users);
});

route_users.get('/:id', async (req, res)=>{
    const id = req.params.id;
    const user = await getUser(id);
    res.send(user);
});

route_users.post('/register', async (req, res) => {
    const {email, password} = req.body.data;
    // console.log(email, password);

    // check if the user exist in db
    const existingUser = await getUserwithEmail(email);
    console.log(existingUser);
    if (existingUser.length > 0 ){
        return res.status(400).json({ message: 'User already exists' });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await insertUser(email, hashedPassword);
    res.status(201).send(user);
});

route_users.post('/login', async(req, res) =>{
    const {email, password} = req.body.data;
    
    const usr = await getUserwithEmail(email);
    // console.log(usr[0].password);
    if(usr.length > 0){
        const match = await bcrypt.compare(password, usr[0].password);
        if(match) {
            //login
            const user = { user_id: usr[0].user_id}
            console.log(user);
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
            res.json({ userid: usr[0].user_id, accessToken: accessToken});
        }else{
            res.json({ message: 'Password does not match' }).status(400);
        }
    }else{
        return res.status(400).json({ message: "User not found"});
    }

})

// expense APIs

// user creats categories
route_users.post('/categories', authenticateJWToken, async (req, res) =>{
    
    const user = req.user_id;
    const category = req.body.data["category"];
    const categories = await createCategories(user.user_id, category);
    res.json(categories);
    
})
route_users.get('/categories/:id', authenticateJWToken, async (req, res) =>{
    
    const userid = req.params.id;
    const categories = await getCategoriesByUser(userid);
    res.json(categories);
})

// Internal use APIs.

route_users.get('/category/name', authenticateJWToken, async (req, res) =>{
    const user = req.user_id;
    const catName = req.query.name;
    console.log(user.user_id, catName);
    const cat_details = await getCatID(catName, user.user_id);
    res.json(cat_details);
})

// user creates expense 

route_users.post('/expense', authenticateJWToken, async (req, res) =>{
    const {user_id, category_id, amount} = req.body.data;
    console.log(user_id, category_id, amount);
    const expense_details = await createExpense(user_id, category_id, amount);
    res.json(expense_details);
})

// sum of categories

route_users.get('/category/sum', authenticateJWToken, async (req, res) =>{
    const user = req.user_id;
    const sumbycats = await categoryBasedSum(user.user_id);
    res.json(sumbycats);
})

export {route_users}