import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import LineTemplateEntity from "../entities/lineTemplate.entity";

@EntityRepository(LineTemplateEntity)
export class LineTemplateRepository extends BaseRepository<LineTemplateEntity>{ }