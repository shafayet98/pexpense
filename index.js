import express from 'express';
import {users} from './routes/users.js';

const app = express();


app.use(express.json());
app.use('/api/users', users);

// app.put();
// app.delete();

app.listen(8080, () => {
    console.log("Server is running on 8080")
});