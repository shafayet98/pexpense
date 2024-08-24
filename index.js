import express from 'express';
import {route_users} from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// app.use(cors());
app.use(cors({
    origin: 'http://expensewise.shafthinks.xyz', // Allow requests from this origin
    methods: 'GET,POST,DELETE', // Specify the methods you want to allow
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'] // Specify the headers you want to allow
}));
app.use(express.json());
app.use('/api/users', route_users);

// app.put();
// app.delete();

app.listen(3000, () => {
    console.log("Server is running on 3000");
});