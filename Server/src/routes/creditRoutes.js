import express from 'express';
import { protect } from '../middlewares/auth.js';
import { getPlans, purchasePlans } from '../controllers/creditController.js';

const creditRouter = express.Router()

creditRouter.get('/plan', getPlans)
creditRouter.post('/purchase', protect, purchasePlans)

export default creditRouter;