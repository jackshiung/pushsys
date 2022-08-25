import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TaskReadEntity from "../entities/taskRead.entity";

@EntityRepository(TaskReadEntity)
export class TaskReadRepository extends BaseRepository<TaskReadEntity>{ }