import { Inject, Service } from "typedi";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { config } from "../configuration";
import { IChatisfyHookData } from "../interfaces/cdp.interface";
import { CDPLibSvc } from "../libs/cdp.lib.svc";
import logger from "./logger.service";

@Service()
export class CDPService {
    @Inject()
    private cdpLibSvc: CDPLibSvc;

    @Transactional({ connectionName: config.mmsDatabase.database })
    async uploadTaskResultToCDP(): Promise<number> {
        return await this.cdpLibSvc.uploadTaskResultToCDP();
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async createTAsToCDP(): Promise<string> {
        return await this.cdpLibSvc.createTAsToCDP();
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async searchTAsFromCDP(params): Promise<string> {
        const { success, responds } = await this.cdpLibSvc.searchTAs(params);
        return responds;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async chatisfyHook(params: IChatisfyHookData): Promise<void> {
        await this.cdpLibSvc.createChatisfyHookData(params);
    }
}