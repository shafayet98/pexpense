import express from 'express';
import { getUsers, getUser, insertUser, getUserwithEmail} from '../database/user.js'
import bcrypt from 'bcrypt';

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
    const {email, password} = req.body;

    // check if the user exist in db
    const existingUser = await getUserwithEmail(email);
    if (existingUser.length > 0 ){
        return res.status(400).json({ message: 'User already exists' });
    }

    // hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await insertUser(email, hashedPassword);
    res.status(201).send(user);
});

// route_users.post('/login', async(req, res) =>{

// })


export {route_users}