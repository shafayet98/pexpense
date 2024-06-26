import express from 'express';
import { getUsers, getUser, insertUser} from '../database/user.js'

const users = express.Router();

users.get('/', async (req, res)=>{
    const users = await getUsers();
    res.send(users);
});


users.get('/:id', async (req, res)=>{
    const id = req.params.id;
    const user = await getUser(id);
    res.send(user);
});

users.post('/', async (req, res) => {
    const {email, password} = req.body;
    const user = await insertUser(email, password);
    res.status(201).send(user);
});

export {users}