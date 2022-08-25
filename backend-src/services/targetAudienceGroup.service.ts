import { Inject, Service } from 'typedi';
import { Transactional } from 'typeorm-transactional-cls-hooked';
import { config } from '../configuration';
import TargetAudienceGroupEntity from '../entities/targetAudienceGroup.entity';
import { ISearchResult } from '../interfaces/base.interface';
import {
    IAddTAParams,
    ICreateTargetAudienceGroupResult,
    IDeleteTargetAudienceGroupParams,
    IDownloadTargetAudienceGroupParams,
    IDownloadTargetAudienceGroupResult,
    ISearchTargetAudienceGroupParams,
    ISearchTargetAudienceGroupResult,
    IUploadTargetAudienceGroupParams,
    ICreateTargetAudienceGroupParams,
} from '../interfaces/targetAudienceGroup.interface';
import { TargetAudienceGroupLibSvc } from '../libs/targetAudienceGroup.lib.svc';

@Service()
export class TargetAudienceGroupService {
    @Inject()
    private targetAudienceGroupLibSvc: TargetAudienceGroupLibSvc;

    async findAll(
        params: ISearchTargetAudienceGroupParams
    ): Promise<ISearchResult<ISearchTargetAudienceGroupResult[]>> {
        const tasks = await this.targetAudienceGroupLibSvc.findAll(params);
        return tasks;
    }

    async findOneAndTAs(id: number): Promise<TargetAudienceGroupEntity> {
        const tasks = await this.targetAudienceGroupLibSvc.findOneAndTAs(id);
        return tasks;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async create(
        params: ICreateTargetAudienceGroupParams
    ): Promise<ICreateTargetAudienceGroupResult> {
        return await this.targetAudienceGroupLibSvc.create(params);
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async upload(
        params: IUploadTargetAudienceGroupParams,
        file
    ): Promise<ICreateTargetAudienceGroupResult> {
        return await this.targetAudienceGroupLibSvc.upload(params, file);
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async download(
        params: IDownloadTargetAudienceGroupParams
    ): Promise<IDownloadTargetAudienceGroupResult> {
        return await this.targetAudienceGroupLibSvc.download(params);
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async addTAs(
        params: IAddTAParams
    ): Promise<ICreateTargetAudienceGroupResult> {
        return await this.targetAudienceGroupLibSvc.addTAs(params);
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async delete(
        params: IDeleteTargetAudienceGroupParams
    ): Promise<TargetAudienceGroupEntity> {
        return await this.targetAudienceGroupLibSvc.delete(params);
    }
}
