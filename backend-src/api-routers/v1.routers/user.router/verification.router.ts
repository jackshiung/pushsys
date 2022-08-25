import { Router } from 'express';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import Container from 'typedi';
import { getAPIResult } from '../../../view-models/result.vm';
import { UserVerificationSvc } from '../../../services/userVerification.service';

const router = Router();

/**
 * 登入
 * @path [POST] /api/v1/user/verification/login
 */
router.post('/login', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const userVerificationSvc = Container.get(UserVerificationSvc);
        const result = await userVerificationSvc.login(req.body);
        res.result = getAPIResult({ token: result });
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * 用舊 token 取得新 token 
 * @path [POST] /api/v1/user/verification/refresh-token
 */
router.post('/refresh-token', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const userToken = req.headers['x-user-token'] as string;
        const userVerificationSvc = Container.get(UserVerificationSvc);
        const result = await userVerificationSvc.refreshToken(userToken);
        res.result = getAPIResult({ token: result });
        next();
    } catch (err) {
        next(err);
    }

})

export default router;