import Container from "typedi";
import { AccessKeyLibSvc } from "../libs/accessKey.lib.svc";
import { AppError } from "../view-models/error.vm";
import { AppRequest, AppResponse } from "../view-models/http.vm";
import { ResultCode } from "../view-models/result.vm";


export async function tokenVerificationMiddleware(req: AppRequest, res: AppResponse, next) {
    /**
     * JWT: 後台登入後需要驗證API是否有待此 token
     * 若驗證失敗則要回傳：
     * { 
     *   success: false,
     *   code: ResultCode.userVerificationError
     * }
     **/
    try {
        const accessKeySvc = Container.get(AccessKeyLibSvc);
        if (!req.licenseTokenPayload) {
            const token = req.header('license-token');
            const accessKey = await accessKeySvc.findOneByKeyOrError(token);
            if (!accessKey) {
                next(new AppError({ message: 'license-token invalid', code: ResultCode.tokenVerificationError }));
                return;
            }
            req.licenseTokenPayload = {
                id: accessKey.id,
                companyId: accessKey.companyId
            };
        }
        next();
    } catch (error) {
        next(new AppError({ message: 'license-token invalid', code: ResultCode.tokenVerificationError }));
    }
}