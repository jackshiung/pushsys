import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TaskErrorLogEntity from "../entities/taskErrorLog.entity";

@EntityRepository(TaskErrorLogEntity)
export class TaskErrorLogRepository extends BaseRepository<TaskErrorLogEntity>{ }