import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Data from './models/Data.js';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB   
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.error('MongoDB connection error:', err));

//Read JSON data
const rawData = fs.readFileSync(path.join(__dirname, 'data', 'jsondata.json'));
const jsonData = JSON.parse(rawData);

// Insert into DB
const importData = async () => {
    try {
        await Data.deleteMany(); // Clear old
        await Data.insertMany(jsonData);
        console.log('Data imported successfully!');
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

importData();