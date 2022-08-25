import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TaskTagEntity from "../entities/taskTag.entity";

@EntityRepository(TaskTagEntity)
export class TaskTagRepository extends BaseRepository<TaskTagEntity>{ }