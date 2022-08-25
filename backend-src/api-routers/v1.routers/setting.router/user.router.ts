import { Router } from 'express';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import Container from 'typedi';
import { getAPIResult, ResultCode } from '../../../view-models/result.vm';
import { AppError } from '../../../view-models/error.vm';
import { UserService } from '../../../services/user.service';

const router = Router();

/**
 * @name 變更登入密碼
 * @path [GET] /api/v1/setting/user/:id
 **/
router.put('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(UserService);
        const item = await svc.update({ id: +req.params.id, ...req.body });
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

export default router;