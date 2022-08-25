import { Inject, Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { ISearchResult } from '../interfaces/base.interface';
import {
    ISearchTargetAudienceParams,
    ISearchTargetAudienceResult,
} from '../interfaces/targetAudience.interface';
import { TargetAudienceLibSvc } from '../libs/targetAudience.lib.svc';
import { config } from '../configuration';

@Service()
export class TargetAudienceService {
    @Inject()
    private targetAudienceLibSvc: TargetAudienceLibSvc;

    async findAll(
        params: ISearchTargetAudienceParams
    ): Promise<ISearchResult<ISearchTargetAudienceResult[]>> {
        const tas = await this.targetAudienceLibSvc.findAll(params);
        return tas;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async createByLineId(lineId: string) {
        const ta = await this.targetAudienceLibSvc.createByLineId(lineId);
        return ta;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async unfollowByLineId(lineId: string) {
        const ta = await this.targetAudienceLibSvc.unfollowByLineId(lineId);
        return ta;
    }
}
