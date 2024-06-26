import express from 'express';
import { getUsers, getUser, insertUser} from './database/user.js'
const app = express();
app.use(express.json());

app.get('/users', async (req, res)=>{
    const users = await getUsers();
    res.send(users);
});


app.get('/users/:id', async (req, res)=>{
    const id = req.params.id;
    const user = await getUser(id);
    res.send(user);
});

app.post('/users', async (req, res) => {
    const {email, password} = req.body;
    const user = await insertUser(email, password);
    res.status(201).send(user);
});
// app.put();
// app.delete();

app.listen(8080, () => {
    console.log("Server is running on 8080")
});