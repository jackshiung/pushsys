import { Router } from 'express';
import verificationRouter from './verification.router';

const router = Router();

router.use('/verification', verificationRouter);

export default router;