import { Router } from 'express';
import { tokenVerificationMiddleware } from '../../../middlewares/verification.middleware';
import taRouter from './ta.router';
import taGroupRouter from './taGroup.router';
const router = Router();

router.use('/', tokenVerificationMiddleware, taRouter);
router.use('/group', tokenVerificationMiddleware, taGroupRouter);

export default router;