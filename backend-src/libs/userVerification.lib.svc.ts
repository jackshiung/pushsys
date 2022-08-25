import { ResultCode } from '../view-models/result.vm';
import { Inject, Service } from "typedi";
import * as bcrypt from "bcrypt";
import { AppError } from "../view-models/error.vm";
import UserEntity from '../entities/user.entity';
import { ILoginParams } from '../interfaces/userVerification.interface';
import { UserLibSvc } from './user.lib.svc';
import { IUserPayload } from '../interfaces/user.interface';
import { JWT } from '../utils/jwt.util';
import { AccessKeyLibSvc } from './accessKey.lib.svc';
import cryptoJS from 'crypto-js';
@Service()
export class UserVerificationLibSvc {

    @Inject()
    readonly userLibSvc: UserLibSvc;
    @Inject()
    readonly accessKeyLibSvc: AccessKeyLibSvc;

    async login(params: ILoginParams): Promise<UserEntity> {
        let user = await this.userLibSvc.findOneByAccountOrError(params);        
        const res = await this.authenticateUser(
            params.account,
            params.password
        );
        if (!res.verified) {
            throw new AppError({
                message: '密碼錯誤',
                code: ResultCode.clientError,
            });
        }
        return user;
    }

    async getToken(user: UserEntity): Promise<string> {
        const access = await this.accessKeyLibSvc.findOneByCompanyIdOrError(user.companyId)
        const payload: IUserPayload = {
            userId: user.id,
            apiKey: access.key
        }
        return await JWT.sign(payload);
    }

    async verifyToken(token: string): Promise<IUserPayload> {
        const payload = await JWT.verify(token);
        if (!payload) {
            throw new AppError({ message: '帳號時效過期，請重新登入', code: ResultCode.userVerificationError });
        }
        return payload;
    }

    private async authenticateUser(
        account: string,
        password: string
    ): Promise<{
        verified: boolean;
        user: UserEntity;
    }> {
        let verified = false;
        const passwordHash = await cryptoJS.HmacSHA256(password, '10');
        const user = await this.userLibSvc.findOneByAccountOrError({
            account,
            password,
        });
        if (user.password == passwordHash.toString()) {
            verified = true;
        }
        return { verified, user };
    }
}