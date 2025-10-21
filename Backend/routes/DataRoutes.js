import express from 'express';
import { getAllData } from '../controllers/DataController.js';

const router = express.Router();

router.get('/', getAllData);

export default router;