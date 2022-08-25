import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TaskTargetAudienceEntity from "../entities/taskTargetAudience.entity";

@EntityRepository(TaskTargetAudienceEntity)
export class TaskTargetAudienceRepository extends BaseRepository<TaskTargetAudienceEntity>{ }