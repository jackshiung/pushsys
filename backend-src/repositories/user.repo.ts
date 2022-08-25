import { EntityRepository, Repository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import UserEntity from "../entities/user.entity";

@EntityRepository(UserEntity)
export class UserRepository extends BaseRepository<UserEntity>{ }