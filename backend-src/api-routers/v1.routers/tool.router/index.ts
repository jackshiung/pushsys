import { Router } from 'express';
import lineRouter from './line';

const router = Router();

router.use('/line', lineRouter);

export default router;
