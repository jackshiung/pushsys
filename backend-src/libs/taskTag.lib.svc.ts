import { Service } from "typedi";
import { IBaseSearchParams, ISearchResult } from "../interfaces/base.interface";
import { BaseService } from "./base.lib.svc";
import { typeChecker } from "camel-toolbox";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { TagRepository } from "../repositories/tag.repo";
import TaskTagEntity from "../entities/taskTag.entity";
import { TaskTagRepository } from "../repositories/taskTag.repo";
import { ICreateTaskTagParams } from "../interfaces/taskTag.interface";
import { config } from "../configuration";

@Service()
export class TaskTagLibSvc extends BaseService<TaskTagEntity>{
    @InjectRepository(config.mmsDatabase.database)
    private readonly taskTagRepository: TaskTagRepository;

    async findOneOrError(id: number): Promise<TaskTagEntity> {
        const taskTag = await this.taskTagRepository.findOne({
            id,
            isDeleted: false
        })
        if (typeChecker.isNullOrUndefinedObject(taskTag)) {
            throw new AppError({ message: '查無此任務標籤', code: ResultCode.clientError })
        }
        return taskTag;
    }

    async search(params: IBaseSearchParams): Promise<ISearchResult<TaskTagEntity[]>> {
        throw new Error("Method not implemented.");
    }
    
    async create(params: ICreateTaskTagParams): Promise<TaskTagEntity> {
        await this.validateObject(ICreateTaskTagParams, params);
        let taskTag = new TaskTagEntity();
        taskTag.taskId = params.taskId;
        taskTag.expirationDays = params.expirationDays;
        return await this.taskTagRepository.save(taskTag);
    }
}