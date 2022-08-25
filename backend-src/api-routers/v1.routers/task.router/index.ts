import { Router } from 'express';
import { tokenVerificationMiddleware } from '../../../middlewares/verification.middleware';
import taskRouter from './task.router';
const router = Router();

router.use('/', tokenVerificationMiddleware, taskRouter);

export default router;