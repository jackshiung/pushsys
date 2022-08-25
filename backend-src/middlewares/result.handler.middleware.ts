import { AppError } from '../view-models/error.vm';
import { ResultCode } from '../view-models/result.vm';
import { AppRequest, AppResponse } from '../view-models/http.vm';
import logger from '../services/logger.service';

export function resultHandler(req: AppRequest, res: AppResponse, next) {
    if (res.result) {
        res.json(res.result)
        res.end();
        return;
    }
    const reqInfo = JSON.stringify({
        ip: req.ip,
        originalUrl: req.originalUrl,
        url: req.url,
        baseUrl: req.baseUrl,
        path: req.path,
        headers: req.headers,
        method: req.method,
        body: req.body,
        query: req.query,
        params: req.params,

    });
    logger.warn(reqInfo);
    next(new AppError({ message: 'no result', code: ResultCode.serverError }));
}