import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TaskEntity from "../entities/task.entity";

@EntityRepository(TaskEntity)
export class TaskRepository extends BaseRepository<TaskEntity>{ }