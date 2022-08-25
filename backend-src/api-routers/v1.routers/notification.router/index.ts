import { Router } from 'express';
import { tokenVerificationMiddleware } from '../../../middlewares/verification.middleware';
import lineRouter from "./line.router";
import taskRouter from '../task.router';
const router = Router()

router.use('/task', tokenVerificationMiddleware, taskRouter);
router.use('/line', tokenVerificationMiddleware, lineRouter);

export default router;