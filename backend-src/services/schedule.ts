import { Inject, Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { CDPLibSvc } from '../libs/cdp.lib.svc';
import { config } from "../configuration";

@Service()
export default class ScheduleService {
    @Inject()
    private cdpLibSvc: CDPLibSvc;

    async uploadTAs(): Promise<string> {
        return await this.cdpLibSvc.createTAsToCDP();
    }

    @Transactional({connectionName: config.mmsDatabase.database})
    async uploadTaskResult(): Promise<void> {
        await this.cdpLibSvc.uploadTaskResultToCDP();
    }
}