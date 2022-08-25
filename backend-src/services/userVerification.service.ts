import { Inject, Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ILoginParams } from '../interfaces/userVerification.interface';
import { UserLibSvc } from '../libs/user.lib.svc';
import { UserVerificationLibSvc } from '../libs/userVerification.lib.svc';
import { config } from "../configuration";

@Service()
export class UserVerificationSvc {

    @Inject()
    private userVerificationLibSvc: UserVerificationLibSvc;
    @Inject()
    private userLibSvc: UserLibSvc;

    @Transactional({connectionName: config.mmsDatabase.database})
    async login(params: ILoginParams): Promise<string> {
        const user = await this.userVerificationLibSvc.login(params);
        const ret = await this.userVerificationLibSvc.getToken(user);
        return ret;
    }

    @Transactional({connectionName: config.mmsDatabase.database})
    async refreshToken(token: string): Promise<string> {
        const payload = await this.userVerificationLibSvc.verifyToken(token);
        const user = await this.userLibSvc.findOneOrError(payload.userId);
        const ret = await this.userVerificationLibSvc.getToken(user);
        return ret;
    }
}