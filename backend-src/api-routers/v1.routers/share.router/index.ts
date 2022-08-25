import { Router } from 'express';
import Container from 'typedi';
import { LineClickedService } from '../../../services/lineClicked.service';
import { ShareService } from '../../../services/share.service';
import { Format } from '../../../utils/format.util';
import { AppError } from '../../../view-models/error.vm';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import { getAPIResult, ResultCode } from '../../../view-models/result.vm';

const router = Router();

/**
 * @name 任務詳細內容
 * @path [GET] /api/v1/share/:code?trace=1
 **/
router.get('/:code', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const code = Format.tryGetString(req.params.code);
        if (!code) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const isTrace = Format.tryGetBoolean(req.query.trace, false);
        if (isTrace) {
            const lineClickedService = Container.get(LineClickedService);
            await lineClickedService.create(code);
        }
        const svc = Container.get(ShareService);
        const item = await svc.getPushMessageByTACode(code);
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
});

export default router;
