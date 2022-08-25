import { typeChecker } from "camel-toolbox";
import logger from "../services/logger.service";
import { AppError, getErrorResult } from "../view-models/error.vm";
import { AppRequest, AppResponse } from "../view-models/http.vm";
import { ResultCode } from "../view-models/result.vm";

export function errorHandler(error, req: AppRequest, res: AppResponse, next) {

    logger.error(error);

    if (typeChecker.isNullOrUndefinedObject(error)) {
        const result = getErrorResult(new AppError({ message: 'unknown error', code: ResultCode.unknown }))
        res.json(result)
        res.end();
        return;
    }

    if (error instanceof AppError) {
        const result = getErrorResult(error)
        res.json(result)
        res.end();
        return;
    } else if (error instanceof Error) {
        const result = getErrorResult(new AppError({ message: error.message, code: ResultCode.unknown }))
        res.json(result)
        res.end();
        return;
    } else {
        const result = getErrorResult(new AppError({ message: 'unknown object', code: ResultCode.unknown }))
        res.json(result)
        res.end();
        return;
    }

}