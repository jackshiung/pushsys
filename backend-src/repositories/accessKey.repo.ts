import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import AccessKeyEntity from "../entities/accessKey.entity";

@EntityRepository(AccessKeyEntity)
export class AccessKeyRepository extends BaseRepository<AccessKeyEntity>{ }