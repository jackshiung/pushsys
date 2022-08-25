import { Router } from 'express';
import { tokenVerificationMiddleware } from '../../../middlewares/verification.middleware';
import lineTemplateRouter from './line.router';

const router = Router();

router.use('/line', tokenVerificationMiddleware, lineTemplateRouter);

export default router;