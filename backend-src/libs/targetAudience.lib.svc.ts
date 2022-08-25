import { typeChecker } from 'camel-toolbox';
import moment from 'moment';
import { Inject, Service } from 'typedi';
import { Between, LessThanOrEqual, Like, MoreThanOrEqual } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { config } from '../configuration';
import TargetAudienceEntity from '../entities/targetAudience.entity';
import { ISearchResult } from '../interfaces/base.interface';
import {
    IBulkUpsertTargetAudienceParams,
    IUpsertTargetAudienceParams,
    ICreateTargetAudienceResult,
    IDeleteTargetAudienceParams,
    ISearchTargetAudienceParams,
    ISearchTargetAudienceResult,
    IUpdateTargetAudienceByLineIdParams,
} from '../interfaces/targetAudience.interface';
import { CompanyRepository } from '../repositories/company.repo';
import { TargetAudienceRepository } from '../repositories/targetAudience.repo';
import { AppError } from '../view-models/error.vm';
import { ResultCode } from '../view-models/result.vm';
import { BaseService } from './base.lib.svc';

@Service()
export class TargetAudienceLibSvc extends BaseService<TargetAudienceEntity> {
    @InjectRepository(config.mmsDatabase.database)
    private readonly targetAudienceRepository: TargetAudienceRepository;
    @InjectRepository(config.mmsDatabase.database)
    private readonly companyRepository: CompanyRepository;

    async findOneOrError(id: number): Promise<TargetAudienceEntity> {
        const ta = await this.targetAudienceRepository.findOne({
            where: {
                id,
                isDeleted: false,
            },
        });
        if (typeChecker.isNullOrUndefinedObject(ta)) {
            throw new AppError({
                message: '查無此受眾',
                code: ResultCode.clientError,
            });
        }
        return ta;
    }

    async findOneByLineIdOrError(
        lineId: string
    ): Promise<TargetAudienceEntity> {
        const ta = await this.targetAudienceRepository.findOne({
            where: {
                lineUserId: lineId,
                isDeleted: false,
            },
        });
        if (typeChecker.isNullOrUndefinedObject(ta)) {
            throw new AppError({
                message: '查無此受眾',
                code: ResultCode.clientError,
            });
        }
        return ta;
    }

    async findAll(
        params: ISearchTargetAudienceParams
    ): Promise<ISearchResult<ISearchTargetAudienceResult[]>> {
        const tas: ISearchTargetAudienceResult[] = [];
        const data = await this.search({ ...params });
        for (const ta of data.rows) {
            tas.push({
                id: ta.id,
                displayName: ta.displayName,
                pictureUrl: ta.pictureUrl,
                email: ta.email,
                createDate: ta.createDate,
                isFollowed: ta.isFollowed,
                lineUserId: ta.lineUserId,
            });
        }
        return {
            count: data.count,
            rows: tas,
        };
    }

    async search(
        params: ISearchTargetAudienceParams
    ): Promise<ISearchResult<TargetAudienceEntity[]>> {
        const filters: any = {};
        filters.isDeleted = false;
        if (params.id) {
            filters.id = params.id;
        }
        if (params.displayName) {
            filters.displayName = Like(`%${params.displayName}%`);
        }
        if (params.createDate1 && params.createDate2) {
            filters.createDate = Between(
                moment(params.createDate1).toDate(),
                moment(params.createDate2).toDate()
            );
        }
        if (params.createDate1) {
            filters.createDate = MoreThanOrEqual(params.createDate1);
        }
        if (params.createDate2) {
            filters.createDate = LessThanOrEqual(params.createDate2);
        }
        if (!typeChecker.isNullOrUndefinedObject(params.isImport)) {
            filters.isImport = params.isImport;
        }
        if (!typeChecker.isNullOrUndefinedObject(params.isFollowed)) {
            filters.isFollowed = params.isFollowed;
        }

        const [tas, count] = await this.targetAudienceRepository.findAndCount({
            where: filters,
            order: {
                id: 'DESC',
            },
            skip: params.offset,
            take: params.limit,
        });

        return {
            rows: tas,
            count,
        };
    }

    async createByLineId(lineId: string): Promise<ICreateTargetAudienceResult> {
        const company = await this.companyRepository.findOne();
        return await this.upsert({
            companyId: company.id,
            lineUserId: lineId,
        });
    }

    async updateByLineId(params: IUpdateTargetAudienceByLineIdParams) {
        const targetAudience = await this.targetAudienceRepository.findOne({
            where: { lineUserId: params.lineId },
        });
        targetAudience.displayName = params.displayName;
        targetAudience.pictureUrl = params.pictureUrl;
        targetAudience.isFollowed = true;
        targetAudience.isDeleted = false;
        const updateTA = await this.targetAudienceRepository.save(targetAudience);
        return updateTA;
    }

    async upsert(
        params: IUpsertTargetAudienceParams
    ): Promise<ICreateTargetAudienceResult> {
        const targetAudience = await this.targetAudienceRepository.findOne({
            where: [{ lineUserId: params.lineUserId }],
        });
        if (targetAudience) {
            targetAudience.isFollowed = true;
            targetAudience.isDeleted = false;
            const updateTA = await this.targetAudienceRepository.save(targetAudience);
            return updateTA;
        } else {
            await this.validateObject(IUpsertTargetAudienceParams, params);
            let newTargetAudience = new TargetAudienceEntity();
            newTargetAudience.companyId = params.companyId;
            newTargetAudience.phone = params.phone;
            newTargetAudience.displayName = params.displayName;
            newTargetAudience.lineUserId = params.lineUserId;
            newTargetAudience.pictureUrl = params.pictureUrl;
            newTargetAudience.email = params.email;
    
            const newTA = await this.targetAudienceRepository.save(
                newTargetAudience
            );
            return newTA;
        }
    }

    async unfollowByLineId(lineId: string) {
        const ta = await this.findOneByLineIdOrError(lineId);
        await this.unfollow({ companyId: ta.companyId, targetAudienceId: ta.id });
    }

    async unfollow(
        params: IDeleteTargetAudienceParams
    ): Promise<TargetAudienceEntity> {
        const targetAudience = await this.findOneOrError(
            params.targetAudienceId
        );
        targetAudience.isFollowed = false;

        const deleteTargetAudience = await this.targetAudienceRepository.save(
            targetAudience
        );
        return deleteTargetAudience;
    }

    async bulkUpsertByGroup(
        params: IBulkUpsertTargetAudienceParams
    ): Promise<number[]> {
        const ids: number[] = [];
        for (const ta of params.tas) {
            const audience = await this.targetAudienceRepository.findOne({
                where: [{ lineUserId: ta.lineUserId }],
            });
            if (audience) {
                audience.phone = ta.phone;
                audience.lineUserId = ta.lineUserId;
                audience.pictureUrl = ta.pictureUrl;
                audience.messagerPSID = ta.messagerPSID;
                audience.email = ta.email;
                audience.isDeleted = false;
                await this.targetAudienceRepository.save(audience);
                ids.push(audience.id);
            } else {
                const newTA = new TargetAudienceEntity();
                newTA.companyId = params.companyId;
                newTA.displayName = ta.displayName;
                newTA.lineUserId = ta.lineUserId;
                newTA.pictureUrl = ta.pictureUrl;
                newTA.messagerPSID = ta.messagerPSID;
                newTA.phone = ta.phone;
                newTA.isImport = false;
                const res = await this.targetAudienceRepository.save(newTA);
                ids.push(res.id);
            }
        }
        return ids;
    }
}
