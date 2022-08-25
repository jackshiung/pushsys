import { Router } from 'express';
import notificationRouter from '../notification.router';
import templateRouter from '../template.router';
import taRouter from '../ta.router';
import fileRouter from '../file.router';
const router = Router()

router.use('/notification', notificationRouter);
router.use('/template', templateRouter);
router.use('/ta', taRouter);
router.use('/file', fileRouter);

export default router;