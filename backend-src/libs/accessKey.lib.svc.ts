import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { config } from "../configuration";
import AccessKeyEntity from "../entities/accessKey.entity";
import { AccessKeyRepository } from "../repositories/accessKey.repo";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";

@Service()
export class AccessKeyLibSvc {
    @InjectRepository(config.mmsDatabase.database)
    private readonly accessKeyRepository: AccessKeyRepository;

    async findOneByKeyOrError(key: string): Promise<AccessKeyEntity> {
        const accessKey = await this.accessKeyRepository.findOne({
            where: { key }
        })
        if (!accessKey) {
            throw new AppError({ message: 'accessKey error', code: ResultCode.clientError })
        }
        return accessKey;
    }

    async findOneByCompanyIdOrError(companyId: number): Promise<AccessKeyEntity> {
        const accessKey = await this.accessKeyRepository.findOneOrFail({
            where: { companyId }
        })
        if (!accessKey) {
            throw new AppError({ message: 'accessKey error', code: ResultCode.clientError })
        }
        return accessKey;
    }
}