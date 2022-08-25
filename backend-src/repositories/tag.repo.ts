import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import TagEntity from "../entities/tag.entity";

@EntityRepository(TagEntity)
export class TagRepository extends BaseRepository<TagEntity>{ }