import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { config } from "../configuration";
import TargetAudienceEntity from "../entities/targetAudience.entity";
import TaskTargetAudienceEntity, { EnumTaskTargetAudienceChannel } from "../entities/taskTargetAudience.entity";
import { ISearchResult } from "../interfaces/base.interface";
import { IBulkCreateTaskTargetAudienceParams, IBulkCreateTaskTargetAudienceByIdParams, IBulkCreateTaskTargetAudienceResult, ICreateTaskTargetAudienceData, ISearchTaskTargetAudienceParams } from "../interfaces/taskTargetAudience.interface";
import { TargetAudienceRepository } from "../repositories/targetAudience.repo";
import { TaskTargetAudienceRepository } from "../repositories/taskTargetAudience.repo";
import { ShortenUrl } from '../utils/shortenUrl.util';
import * as _ from 'lodash';

@Service()
export class TaskTargetAudienceLibSvc {
    @InjectRepository(config.mmsDatabase.database)
    private readonly taskTargetAudienceRepository: TaskTargetAudienceRepository;
    @InjectRepository(config.mmsDatabase.database)
    private readonly targetAudienceRepository: TargetAudienceRepository; å

    async findNotSendByTaskId(taskId: number): Promise<TaskTargetAudienceEntity[]> {
        const taskTargetAudiences = await this.taskTargetAudienceRepository.createQueryBuilder('taskTargetAudience')
            .leftJoinAndSelect('taskTargetAudience.targetAudience', 'targetAudience')
            .where('taskTargetAudience.taskId = :taskId')
            .andWhere('taskTargetAudience.isSent = false')
            .setParameters({
                taskId
            })
            .getMany();

        return taskTargetAudiences;
    }

    async findNotExport(): Promise<TaskTargetAudienceEntity[]> {
        const taskTargetAudiences = await this.taskTargetAudienceRepository.createQueryBuilder('taskTargetAudience')
            .leftJoinAndSelect('taskTargetAudience.targetAudience', 'targetAudience')
            .where('taskTargetAudience.isExport = false')
            .getMany();

        return taskTargetAudiences;
    }

    async findOneByTaskTACode(code: String): Promise<TaskTargetAudienceEntity> {
        const taskTargetAudience = await this.taskTargetAudienceRepository.createQueryBuilder('taskTargetAudience')
            .leftJoinAndSelect('taskTargetAudience.targetAudience', 'targetAudience')
            .leftJoinAndSelect('taskTargetAudience.task', 'task')
            .where('taskTargetAudience.code = :code')
            .setParameters({
                code
            })
            .getOne();
        return taskTargetAudience;
    }

    async search(params: ISearchTaskTargetAudienceParams): Promise<ISearchResult<TaskTargetAudienceEntity[]>> {
        let filters: any = {};
        if (params.taskId) {
            filters.taskId = params.taskId;
        }
        if (params.isExport != undefined) {
            filters.isExport = params.isExport;
        }
        const result = await this.taskTargetAudienceRepository.findAndCount({
            where: filters,
            skip: params.offset,
            take: params.limit
        });
        return {
            rows: result[0],
            count: result[1]
        };
    }

    async bulkCreate(params: IBulkCreateTaskTargetAudienceParams): Promise<IBulkCreateTaskTargetAudienceResult> {
        let ids: number[] = [];
        if (params.taIds) {
            ids = ids.concat(params.taIds);
        }
        for (const ta of params.tas) {
            const audience = await this.targetAudienceRepository.findOne({
                where: [
                    { phone: ta.phone },
                    { lineUserId: ta.lineUserId },
                    { pictureUrl: ta.pictureUrl },
                    { messagerPSID: ta.messagerPSID },
                    { email: ta.email }
                ]
            });
            if (audience) {
                ids.push(audience.id);
            } else {
                const newTA = new TargetAudienceEntity();
                newTA.companyId = params.companyId;
                newTA.displayName = ta.displayName;
                newTA.lineUserId = ta.lineUserId;
                newTA.pictureUrl = ta.pictureUrl;
                newTA.messagerPSID = ta.messagerPSID;
                newTA.phone = ta.phone;
                newTA.email = ta.email;
                const res = await this.targetAudienceRepository.save(newTA);
                ids.push(res.id);
            }
        }

        ids = _.uniq(ids);

        return await this.bulkCreateById({ taskId: params.taskId, targetAudienceIds: ids });
    }

    async bulkCreateById(params: IBulkCreateTaskTargetAudienceByIdParams): Promise<IBulkCreateTaskTargetAudienceResult> {
        const taskTAs: ICreateTaskTargetAudienceData[] = [];

        for (const id of params.targetAudienceIds) {
            taskTAs.push({
                taskId: params.taskId,
                targetAudienceId: id,
                code: ShortenUrl.makeRandomStringByNanotime(),
                channel: EnumTaskTargetAudienceChannel.Line //TODO: 任務渠道判斷
            });
        }

        const res = await this.taskTargetAudienceRepository.save(taskTAs);

        return {
            count: res.length,
            rows: res
        };
    }

    async deleteAll(taskId: number) {
        const taskTAs = await this.taskTargetAudienceRepository.find({ where: { taskId } });
        await this.taskTargetAudienceRepository.remove(taskTAs);
    }

    async updateSuccess(taskId: number, targetAudienceId: number) {
        const ta = await this.taskTargetAudienceRepository.findOneOrFail({ where: { taskId, targetAudienceId } });
        ta.isSuccess = true;
        await this.taskTargetAudienceRepository.save(ta);
    }

    async updateFault(taskId: number, targetAudienceId: number) {
        const ta = await this.taskTargetAudienceRepository.findOneOrFail({ where: { taskId, targetAudienceId } });
        ta.isExport = false;
        await this.taskTargetAudienceRepository.save(ta);
    }

    async updateSent(taskId: number, targetAudienceId: number) {
        const ta = await this.taskTargetAudienceRepository.findOneOrFail({ where: { taskId, targetAudienceId } });
        ta.isSent = true;
        await this.taskTargetAudienceRepository.save(ta);
    }

    async updateExport(params: { taskId: number, targetAudienceId: number, isExport: boolean }) {
        const ta = await this.taskTargetAudienceRepository.findOneOrFail({ where: { taskId: params.taskId, targetAudienceId: params.targetAudienceId } });
        ta.isExport = params.isExport;
        await this.taskTargetAudienceRepository.save(ta);
    }

    async updateExportByTACode(params: { code: string, isExport: boolean }) {
        const taskTA = await this.findOneByTaskTACode(params.code);
        const ta = await this.taskTargetAudienceRepository.findOneOrFail({ where: { taskId: taskTA.taskId, targetAudienceId: taskTA.targetAudienceId } });
        ta.isExport = params.isExport;
        await this.taskTargetAudienceRepository.save(ta);
    }
}