import { Inject, Service } from "typedi";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { config } from "../configuration";
import TaskEntity from "../entities/task.entity";
import { IBaseSearchParams, ISearchResult } from "../interfaces/base.interface";
import { ICreateTAParams, ICreateTaskParams, IResendTaskParams, IResendTaskResult, ISearchTaskResult, IUpdateTaskParams } from "../interfaces/task.interface";
import { IBulkCreateTaskTargetAudienceResult } from "../interfaces/taskTargetAudience.interface";
import { TaskLibSvc } from "../libs/task.lib.svc";
import { TaskTargetAudienceLibSvc } from "../libs/taskTargetAudience.lib";

@Service()
export class TaskService {
    @Inject()
    private taskLibSvc: TaskLibSvc;
    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;

    @Transactional({ connectionName: config.mmsDatabase.database })
    async create(params: ICreateTaskParams) {
        const task = await this.taskLibSvc.create(params);
        return task;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async update(params: IUpdateTaskParams) {
        const task = await this.taskLibSvc.update(params);
        return task;
    }

    async findAll(params: IBaseSearchParams): Promise<ISearchResult<ISearchTaskResult[]>> {
        const tasks = await this.taskLibSvc.findAll(params);
        return tasks;
    }

    async findOne(id: number): Promise<ISearchTaskResult> {
        const task = await this.taskLibSvc.findOne(id);
        return task;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async confirm(taskId: number): Promise<TaskEntity> {
        const task = await this.taskLibSvc.confirm(taskId);
        return task;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async resend(params: IResendTaskParams): Promise<IResendTaskResult> {
        const task = await this.taskLibSvc.resend(params);
        return task;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async delete(taskId: number): Promise<TaskEntity> {
        const task = await this.taskLibSvc.delete(taskId);
        return task;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async createTAs(params: ICreateTAParams): Promise<IBulkCreateTaskTargetAudienceResult> {
        const tas = await this.taskTargetAudienceLibSvc.bulkCreate(params);
        return tas;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async resetTAs(taskId: number): Promise<boolean> {
        await this.taskTargetAudienceLibSvc.deleteAll(taskId);
        return true;
    }
}