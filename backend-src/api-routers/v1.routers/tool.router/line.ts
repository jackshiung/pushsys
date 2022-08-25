import { Router } from 'express';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import Container from 'typedi';
import { getAPIResult } from '../../../view-models/result.vm';
import { LineLibSvc } from '../../../libs/line.lib.svc';

const router = Router();

/**
 * 匯入TAs
 * @path [POST] /api/v1/tool/line/followers
 */
router.post('/followers', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const lineLibSvc = Container.get(LineLibSvc);
        const result = await lineLibSvc.followerIds({ limit: req.body.limit });
        res.result = getAPIResult({ token: result });
        next();
    } catch (err) {
        next(err);
    }
});

export default router;
