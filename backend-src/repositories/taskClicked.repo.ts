import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TaskClickedEntity from "../entities/taskClicked.entity";

@EntityRepository(TaskClickedEntity)
export class TaskClickedRepository extends BaseRepository<TaskClickedEntity>{ }