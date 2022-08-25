import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TargetAudienceGroupItemEntity from "../entities/targetAudienceGroupItem.entity";

@EntityRepository(TargetAudienceGroupItemEntity)
export class TargetAudienceGroupItemRepository extends BaseRepository<TargetAudienceGroupItemEntity>{ }