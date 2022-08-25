import { typeChecker } from 'camel-toolbox';
import moment from 'moment';
import { Inject, Service } from 'typedi';
import { Not, In } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { config } from '../configuration';
import TargetAudienceGroupEntity, {
    EnumSourceType,
} from '../entities/targetAudienceGroup.entity';
import { ISearchResult } from '../interfaces/base.interface';
import {
    IAddTAParams,
    IBulkCreateTargetAudienceGroupByIdParams,
    ICreateTargetAudienceGroupData,
    ICreateTargetAudienceGroupItemResult,
    IImportTargetAudienceGroupParams,
    ICreateTargetAudienceGroupResult,
    IDeleteTargetAudienceGroupParams,
    IDownloadTargetAudienceGroupParams,
    IDownloadTargetAudienceGroupResult,
    ISearchTargetAudienceGroupParams,
    ISearchTargetAudienceGroupResult,
    IUploadTargetAudienceGroupParams,
    ICreateTargetAudienceGroupParams,
    IUpdateTargetAudienceGroupParams,
    IUpdateTargetAudienceGroupResult,
} from '../interfaces/targetAudienceGroup.interface';
import { TargetAudienceRepository } from '../repositories/targetAudience.repo';
import { TargetAudienceGroupRepository } from '../repositories/targetAudienceGroup.repo';
import { TargetAudienceGroupItemRepository } from '../repositories/targetAudienceGroupItem.repo';
import { AppError } from '../view-models/error.vm';
import { ResultCode } from '../view-models/result.vm';
import { TargetAudienceLibSvc } from './targetAudience.lib.svc';
import XLSX from 'xlsx';
import { ICreateTaskTargetAudienceParams } from '../interfaces/taskTargetAudience.interface';
import { ExcelTemplater } from '../utils/excelTemplater.util';

@Service()
export class TargetAudienceGroupLibSvc {
    @InjectRepository(config.mmsDatabase.database)
    private readonly targetAudienceRepository: TargetAudienceRepository;

    @InjectRepository(config.mmsDatabase.database)
    private readonly targetAudienceGroupRepository: TargetAudienceGroupRepository;

    @InjectRepository(config.mmsDatabase.database)
    private readonly targetAudienceGroupItemRepository: TargetAudienceGroupItemRepository;

    @Inject()
    private targetAudienceLibSvc: TargetAudienceLibSvc;

    async findAll(
        params: ISearchTargetAudienceGroupParams
    ): Promise<ISearchResult<ISearchTargetAudienceGroupResult[]>> {
        const queryBuilder =
            this.targetAudienceGroupRepository.createQueryBuilder(
                'targetAudienceGroup'
            );
        queryBuilder.where(`targetAudienceGroup.isDeleted = false`);
        if (params.offset) {
            queryBuilder.skip(params.offset);
        }
        if (params.limit) {
            queryBuilder.take(params.limit);
        }

        let values: any = {};
        if (values.id) {
            queryBuilder.andWhere('targetAudienceGroup.id = :id');
            values.id = params.id;
        }
        if (params.name) {
            queryBuilder.andWhere(`targetAudienceGroup.name like :name`);
            values.name = `%${params.name}%`;
        }
        queryBuilder.setParameters(values);
        queryBuilder.orderBy('targetAudienceGroup.id', 'DESC');

        const [targetAudienceGroups, count] =
            await queryBuilder.getManyAndCount();

        const result = targetAudienceGroups.map((group) => ({
            id: group.id,
            name: group.name,
            taCount: group.taCount,
            sourceType: group.sourceType,
            createDate: moment(group.createDate).format('YYYY-MM-DD HH:mm'),
        }));

        return {
            count,
            rows: result,
        };
    }

    async findOneOrError(id: number): Promise<TargetAudienceGroupEntity> {
        const group = await this.targetAudienceGroupRepository.findOne({
            id,
            isDeleted: false,
        });
        if (typeChecker.isNullOrUndefinedObject(group)) {
            throw new AppError({
                message: '查無此受眾包',
                code: ResultCode.clientError,
            });
        }
        return group;
    }

    async findOneAndTAs(id: number): Promise<TargetAudienceGroupEntity> {
        const targetAudienceGroup = await this.targetAudienceGroupRepository
            .createQueryBuilder('targetAudienceGroup')
            .leftJoinAndSelect(
                'targetAudienceGroup.targetAudienceGroupItems',
                'targetAudienceGroupItem'
            )
            .leftJoinAndSelect(
                'targetAudienceGroupItem.targetAudience',
                'targetAudience'
            )
            .where('targetAudienceGroup.id = :id')
            .andWhere('targetAudienceGroup.isDeleted = false')
            .setParameters({
                id,
            })
            .getOne();

        return targetAudienceGroup;
    }

    async upload(
        params: IUploadTargetAudienceGroupParams,
        file: Express.Multer.File
    ): Promise<ICreateTargetAudienceGroupResult> {
        const tas: ICreateTaskTargetAudienceParams[] = [];

        const workBook = XLSX.read(file.buffer, { type: 'buffer' });
        const workSheet: XLSX.WorkSheet =
            workBook.Sheets[workBook.SheetNames[0]];
        const sheetJson = XLSX.utils.sheet_to_json<{ LineID: string }>(
            workSheet
        );

        sheetJson.forEach((data) => {
            if (data.LineID) {
                tas.push({
                    lineUserId: data.LineID,
                });
            }
        });

        return await this.import({
            ...params,
            tas,
        });
    }

    async create(
        params: ICreateTargetAudienceGroupParams
    ): Promise<ICreateTargetAudienceGroupResult> {
        const targetAudienceGroup = new TargetAudienceGroupEntity();
        targetAudienceGroup.name = params.name;
        targetAudienceGroup.sourceType = EnumSourceType.WEB;
        const newTargetAudienceGroup =
            await this.targetAudienceGroupRepository.save(targetAudienceGroup);

        const tas = await this.targetAudienceLibSvc.search({
            displayName: params.filters.name,
            createDate1: params.filters.date1,
            createDate2: params.filters.date2,
            isImport: params.filters.isImport,
            isFollowed: params.filters.isFollowed,
        });

        const items = await this.bulkCreateById({
            groupId: newTargetAudienceGroup.id,
            targetAudienceIds: tas.rows.map((data) => data.id),
        });

        await this.update({
            taCount: items.count,
            targetAudienceGroupId: newTargetAudienceGroup.id,
        });

        return {
            ...newTargetAudienceGroup,
            items,
        };
    }

    async update(
        params: IUpdateTargetAudienceGroupParams
    ): Promise<IUpdateTargetAudienceGroupResult> {
        const targetAudienceGroup = await this.findOneOrError(
            params.targetAudienceGroupId
        );

        if (params.name) {
            targetAudienceGroup.name = params.name;
        }
        if (params.taCount) {
            targetAudienceGroup.taCount = params.taCount;
        }

        const updateTargetAudienceGroup =
            await this.targetAudienceGroupRepository.save(targetAudienceGroup);

        return {
            targetAudienceGroupId: updateTargetAudienceGroup.id,
            name: updateTargetAudienceGroup.name,
        };
    }

    async import(
        params: IImportTargetAudienceGroupParams
    ): Promise<ICreateTargetAudienceGroupResult> {
        const targetAudienceGroup = new TargetAudienceGroupEntity();
        targetAudienceGroup.name = params.name;
        targetAudienceGroup.sourceType = EnumSourceType.WEB;
        const newTargetAudienceGroup =
            await this.targetAudienceGroupRepository.save(targetAudienceGroup);

        const ids: number[] = [];
        for (const ta of params.tas) {
            const audience = await this.targetAudienceRepository.findOne({
                where: [{ lineUserId: ta.lineUserId }],
            });
            if (audience) {
                ids.push(audience.id);
            }
        }

        const items = await this.bulkCreateById({
            groupId: newTargetAudienceGroup.id,
            targetAudienceIds: ids,
        });

        await this.update({
            taCount: items.count,
            targetAudienceGroupId: newTargetAudienceGroup.id,
        });

        return {
            ...newTargetAudienceGroup,
            items,
        };
    }

    async bulkCreateById(
        params: IBulkCreateTargetAudienceGroupByIdParams
    ): Promise<ICreateTargetAudienceGroupItemResult> {
        const items: ICreateTargetAudienceGroupData[] = [];
        for (const id of params.targetAudienceIds) {
            items.push({
                targetAudienceGroupId: params.groupId,
                targetAudienceId: id,
            });
        }
        const res = await this.targetAudienceGroupItemRepository.save(items);

        return {
            count: res.length,
            rows: res,
        };
    }

    async addTAs(
        params: IAddTAParams
    ): Promise<ICreateTargetAudienceGroupResult> {
        const group = await this.findOneOrError(params.targetAudienceGroupId);

        const ids = await this.targetAudienceLibSvc.bulkUpsertByGroup({
            companyId: params.companyId,
            tas: params.tas,
        });

        const res = await this.targetAudienceGroupItemRepository.find({
            targetAudienceId: In(ids),
        });

        const newIds = ids.filter(
            (id) => !res.map((data) => data.targetAudienceId).includes(id)
        );
        const items = await this.bulkCreateById({
            groupId: group.id,
            targetAudienceIds: newIds,
        });

        const taCount = await this.targetAudienceGroupItemRepository.count({
            where: { targetAudienceGroupId: group.id },
        });

        await this.update({
            taCount,
            targetAudienceGroupId: group.id,
        });

        return {
            ...group,
            items,
        };
    }

    async download(
        params: IDownloadTargetAudienceGroupParams
    ): Promise<IDownloadTargetAudienceGroupResult> {
        const targetAudienceGroup = await this.findOneAndTAs(
            params.targetAudienceGroupId
        );
        const customerRows = targetAudienceGroup.targetAudienceGroupItems.map(
            (ta) => ({ LineID: ta.targetAudience.lineUserId })
        );

        const cellStyle = { border: true, horizontalAlignment: 'center' };

        const excelTemplater = new ExcelTemplater();
        await excelTemplater.load(
            __dirname + '/../../templates/TargetAudienceGroup.xlsx'
        );
        excelTemplater.sheet('LINE');
        await excelTemplater.fillRows({
            startRowIndex: 3,
            rows: customerRows,
            cellStyle: cellStyle,
        });
        const fileName = `${targetAudienceGroup.name}-${moment().format(
            'YYYYMMDDHHmmss'
        )}.xlsx`;
        const content = await excelTemplater.output();

        return {
            content,
            fileName,
        };
    }

    async delete(
        params: IDeleteTargetAudienceGroupParams
    ): Promise<TargetAudienceGroupEntity> {
        const targetAudienceGroup = await this.findOneOrError(
            params.targetAudienceGroupId
        );
        targetAudienceGroup.isDeleted = true;

        const deleteTargetAudienceGroup =
            await this.targetAudienceGroupRepository.save(targetAudienceGroup);
        return deleteTargetAudienceGroup;
    }
}
