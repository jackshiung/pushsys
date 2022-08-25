import { Router } from 'express';
import Container from 'typedi';
import { TargetAudienceService } from '../../../services/targetAudience.service';
import { Format } from '../../../utils/format.util';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import { getAPIListResult, getAPIResult } from '../../../view-models/result.vm';

const router = Router();

/**
 * @name 受眾清單
 * @path [GET] /api/v1/management/ta?p=1&ps=10
 * @Path [GET] /api/v1/ta?p=1
 *
 **/
router.get('/', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const p = Format.tryGetInteger(req.query.p, 1);
        const ps = Format.tryGetInteger(req.query.ps, 10);
        const displayName = Format.tryGetString(req.query.name);
        const createDate1 = Format.tryGetDate(req.query.date1);
        const createDate2 = Format.tryGetDate(req.query.date2);
        const isImport = Format.tryGetBoolean(req.query.is_import);
        const isFollowed = Format.tryGetBoolean(req.query.is_followed);
        const offset = (p - 1) * ps;
        const svc = Container.get(TargetAudienceService);
        const data = await svc.findAll({
            isImport,
            isFollowed,
            displayName,
            createDate1,
            createDate2,
            limit: ps,
            offset,
        });
        res.result = getAPIListResult(data.rows, {
            dataAmount: data.count,
            pageAmount: Math.ceil(data.count / ps),
            pageIndex: p,
            pageSize: ps,
        });
        next();
    } catch (err) {
        next(err);
    }
});

export default router;
