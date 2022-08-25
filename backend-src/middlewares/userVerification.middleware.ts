import { AppRequest, AppResponse } from '../view-models/http.vm';
import { AppError } from '../view-models/error.vm';
import { ResultCode } from '../view-models/result.vm';
import { JWT } from '../utils/jwt.util';
import Container from 'typedi';
import { AccessKeyLibSvc } from '../libs/accessKey.lib.svc';
import { UserLibSvc } from '../libs/user.lib.svc';

export async function userVerificationMiddleware(req: AppRequest, res: AppResponse, next) {
    /**
     * JWT: 後台登入後需要驗證API是否有待此 token
     * 若驗證失敗則要回傳：
     * { 
     *   success: false,
     *   code: ResultCode.userVerificationError
     * }
     **/
    try {
        if (!req.originalUrl.includes('/user/verification/login')) {
            const userToken = req.headers['x-user-token']
            const payload = await JWT.verify(<string>userToken);
            if (!payload) {
                next(new AppError({ message: 'token invalid', code: ResultCode.userVerificationError }));
                return;
            }
            req.userTokenPayload = payload

            const userLibSvc = Container.get(UserLibSvc);
            const user = await userLibSvc.findOneOrError(payload.userId);

            const accessKeySvc = Container.get(AccessKeyLibSvc);
            const accessKey = await accessKeySvc.findOneByCompanyIdOrError(user.companyId)
            if (!accessKey) {
                next(new AppError({ message: 'license-token invalid', code: ResultCode.tokenVerificationError }));
                return;
            }
            req.headers['license-token'] = accessKey.key;
            req.licenseTokenPayload = {
                id: accessKey.id,
                companyId: accessKey.companyId
            };
        }
        next();
    } catch (error) {
        next(new AppError({ message: 'token invalid', code: ResultCode.userVerificationError }));
    }
}