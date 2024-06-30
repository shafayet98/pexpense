import express from 'express';
import {route_users} from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());



app.use('/api/users', route_users);


// app.put();
// app.delete();

app.listen(8080, () => {
    console.log("Server is running on 8080")
});