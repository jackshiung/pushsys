import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import CDPTargetAudienceEntity from "../entities/cdpTargetAudience.entity";

@EntityRepository(CDPTargetAudienceEntity)
export class CDPTargetAudienceRepository extends BaseRepository<CDPTargetAudienceEntity>{ }