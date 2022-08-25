import { EntityRepository } from "typeorm";
import { BaseRepository } from "typeorm-transactional-cls-hooked";
import CompanyEntity from "../entities/company.entity";

@EntityRepository(CompanyEntity)
export class CompanyRepository extends BaseRepository<CompanyEntity>{ }