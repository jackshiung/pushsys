import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TargetAudienceEntity from "../entities/targetAudience.entity";

@EntityRepository(TargetAudienceEntity)
export class TargetAudienceRepository extends BaseRepository<TargetAudienceEntity>{ }