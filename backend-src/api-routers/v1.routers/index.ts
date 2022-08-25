import { Router } from 'express';
import notificationRouter from "./notification.router";
import userRouter from "./user.router";
import templateRouter from "./template.router";
import { userVerificationMiddleware } from '../../middlewares/userVerification.middleware';
import managementRouters from "./management.router";
import taRouter from './ta.router';
import shareRouter from './share.router';
import { tokenVerificationMiddleware } from '../../middlewares/verification.middleware';
import settingRouter from './setting.router';

const router = Router()

router.use('/setting', tokenVerificationMiddleware, settingRouter);
router.use('/user', userVerificationMiddleware, userRouter);
router.use('/notification', notificationRouter)
router.use('/ta', taRouter);
router.use('/template', templateRouter);
router.use('/management', userVerificationMiddleware, managementRouters);
router.use('/share', shareRouter);

export default router;