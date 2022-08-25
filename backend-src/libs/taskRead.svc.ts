import { typeChecker } from "camel-toolbox";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { config } from "../configuration";
import { EnumTaskChannel } from "../entities/task.entity";
import TaskReadEntity from "../entities/taskRead.entity";
import { ISearchResult } from "../interfaces/base.interface";
import { ISearchTaskReadParams } from "../interfaces/taskRead.interface";
import { TaskReadRepository } from "../repositories/taskRead.repo";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { BaseService } from "./base.lib.svc";
import { TaskTargetAudienceLibSvc } from "./taskTargetAudience.lib";

@Service()
export class TaskReadLibSvc extends BaseService<TaskReadEntity>{
    @InjectRepository(config.mmsDatabase.database)
    private readonly taskReadRepository: TaskReadRepository;

    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;

    async findOneByTaskAndTA(taskId: number, targetAudienceId: number): Promise<TaskReadEntity | null> {
        const taskReadTA = await this.taskReadRepository.findOne({
            taskId, targetAudienceId
        });
        if (typeChecker.isNullOrUndefinedObject(taskReadTA)) {
            return null;
        }
        return taskReadTA;
    }

    async findOneOrError(id: number): Promise<TaskReadEntity> {
        const taskClickedTA = await this.taskReadRepository.findOne({
            id
        })
        if (typeChecker.isNullOrUndefinedObject(taskClickedTA)) {
            throw new AppError({ message: '查無此任務TA已讀', code: ResultCode.clientError })
        }
        return taskClickedTA;
    }

    async search(params: ISearchTaskReadParams): Promise<ISearchResult<TaskReadEntity[]>> {
        const filters: any = {};
        if (params.id) {
            filters.id = params.id;
        }
        if (params.taskId) {
            filters.taskId = params.taskId;
        }
        const result = await this.taskReadRepository.findAndCount({
            where: filters
        });
        return {
            rows: result[0],
            count: result[1]
        }
    }

    async getReadCount(taskId: number): Promise<number> {
        const res = await this.taskReadRepository.query(`
            SELECT COUNT(DISTINCT taskRead.target_audience_id) count FROM jj_mms.task_read taskRead WHERE taskRead.task_id = ?
        `, [taskId]);
        return res[0].count;
    }

    async create(code: string): Promise<TaskReadEntity | null> {
        const taskTA = await this.taskTargetAudienceLibSvc.findOneByTaskTACode(code);
        if (taskTA) {
            const channel: string = taskTA.channel;

            let taskClicked = new TaskReadEntity();
            taskClicked.taskId = taskTA.taskId;
            taskClicked.channel = <EnumTaskChannel>channel;
            taskClicked.targetAudienceId = taskTA.targetAudienceId;
            return await this.taskReadRepository.save(taskClicked);
        }
        return null;
    }
}