import { Inject, Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { UserLibSvc } from '../libs/user.lib.svc';
import { config } from "../configuration";
import { IUpdateUserParams } from '../interfaces/user.interface';

@Service()
export class UserService {
    @Inject()
    private userLibSvc: UserLibSvc;

    @Transactional({connectionName: config.mmsDatabase.database})
    async update(params: IUpdateUserParams) {
        await this.userLibSvc.update(params);
    }
}