import { typeChecker } from "camel-toolbox";
import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { config } from "../configuration";
import { EnumTaskChannel } from "../entities/task.entity";
import TaskClickedEntity from "../entities/taskClicked.entity";
import { ISearchResult } from "../interfaces/base.interface";
import { ISearchTaskClickedParams as ISearchTaskClickedParams } from "../interfaces/taskClicked.interface";
import { TaskClickedRepository } from "../repositories/taskClicked.repo";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { BaseService } from "./base.lib.svc";
import { TaskTargetAudienceLibSvc } from "./taskTargetAudience.lib";

@Service()
export class TaskClickedLibSvc extends BaseService<TaskClickedEntity>{
    @InjectRepository(config.mmsDatabase.database)
    private readonly taskClickedRepository: TaskClickedRepository;

    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;

    async findOneByTaskAndTA(taskId: number, targetAudienceId: number): Promise<TaskClickedEntity | null> {
        const taskClickedTA = await this.taskClickedRepository.findOne({
            taskId, targetAudienceId
        });
        if (typeChecker.isNullOrUndefinedObject(taskClickedTA)) {
            return null;
        }
        return taskClickedTA;
    }

    async findOneOrError(id: number): Promise<TaskClickedEntity> {
        const taskClickedTA = await this.taskClickedRepository.findOne({
            id
        })
        if (typeChecker.isNullOrUndefinedObject(taskClickedTA)) {
            throw new AppError({ message: '查無此任務TA回覆', code: ResultCode.clientError })
        }
        return taskClickedTA;
    }

    async search(params: ISearchTaskClickedParams): Promise<ISearchResult<TaskClickedEntity[]>> {
        const filters: any = {};
        filters.isDeleted = false;
        if (params.id) {
            filters.id = params.id;
        }
        if (params.taskId) {
            filters.taskId = params.taskId;
        }
        const result = await this.taskClickedRepository.findAndCount();
        return {
            rows: result[0],
            count: result[1]
        }
    }

    async getClickedCount(taskId: number): Promise<number> {
        const res = await this.taskClickedRepository.query(`
            SELECT COUNT(DISTINCT taskClicked.target_audience_id) count FROM jj_mms.task_clicked taskClicked WHERE taskClicked.task_id = ?
        `, [taskId]);

        return res[0].count;
    }

    async create(code: string): Promise<TaskClickedEntity | null> {
        const taskTA = await this.taskTargetAudienceLibSvc.findOneByTaskTACode(code);
        if (taskTA) {
            const channel: string = taskTA.channel;

            let taskClicked = new TaskClickedEntity();
            taskClicked.taskId = taskTA.taskId;
            taskClicked.channel = <EnumTaskChannel>channel;
            taskClicked.targetAudienceId = taskTA.targetAudienceId;
            return await this.taskClickedRepository.save(taskClicked);
        }
        return null;
    }
}