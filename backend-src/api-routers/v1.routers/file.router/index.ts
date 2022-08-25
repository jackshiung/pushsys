import { Router } from 'express';
import { tokenVerificationMiddleware } from '../../../middlewares/verification.middleware';
import uploadRouter from './file.router';
const router = Router();

router.use('/', tokenVerificationMiddleware, uploadRouter);

export default router;