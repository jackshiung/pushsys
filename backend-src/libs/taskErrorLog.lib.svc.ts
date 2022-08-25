import { Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { config } from "../configuration";
import TaskErrorLogEntity from "../entities/taskErrorLog.entity";
import { ICreateTaskErrorParams } from "../interfaces/taskErrorLog.interface";
import { TaskErrorLogRepository } from "../repositories/taskErrorLog.repo";

@Service()
export class TaskErrorLogLibSvc {
    @InjectRepository(config.mmsDatabase.database)
    private readonly taskErrorLogRepository: TaskErrorLogRepository;

    async create(params: ICreateTaskErrorParams): Promise<TaskErrorLogEntity> {
        const taskErrorLog = new TaskErrorLogEntity();
        taskErrorLog.taskId = params.taskId;
        taskErrorLog.targetAudienceId = params.targetAudienceId;
        taskErrorLog.code = params.code;
        taskErrorLog.message = params.message;

        const newtaskErrorLog = await this.taskErrorLogRepository.save(taskErrorLog);
        return newtaskErrorLog;
    }
}