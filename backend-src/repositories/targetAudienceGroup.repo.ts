import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TargetAudienceGroupEntity from "../entities/targetAudienceGroup.entity";

@EntityRepository(TargetAudienceGroupEntity)
export class TargetAudienceGroupRepository extends BaseRepository<TargetAudienceGroupEntity>{ }