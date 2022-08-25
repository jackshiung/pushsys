import { Inject, Service } from "typedi";
import { ISearchUserParams, IUpdateUserParams, IUpdateUserResult } from "../interfaces/user.interface";
import { ISearchResult } from "../interfaces/base.interface";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { BaseService } from "./base.lib.svc";
import UserEntity from "../entities/user.entity";
import { ILoginParams } from "../interfaces/userVerification.interface";
import { UserRepository } from "../repositories/user.repo";
import { config } from "../configuration";
import cryptoJS from 'crypto-js';

@Service()
export class UserLibSvc extends BaseService<UserEntity>{
    @InjectRepository(config.mmsDatabase.database)
    private readonly userRepository: UserRepository;

    async findOneOrError(id: number): Promise<UserEntity> {
        let data = await this.userRepository.findOneOrFail(id);
        if (!data) throw new AppError({ message: `找不到使用者(${id})`, code: ResultCode.clientError });
        return data;
    }

    async findOneByAccountOrError(params: ILoginParams): Promise<UserEntity> {
        let data = await this.search({ account: params.account });
        let user = data.count == 1 ? data.rows[0] : null;
        if (!user) throw new AppError({ message: `找不到使用者(${params.account})`, code: ResultCode.clientError });
        return user;
    }

    async search(params: ISearchUserParams): Promise<ISearchResult<UserEntity[]>> {
        await this.validateObject(ISearchUserParams, params);
        const filters: any = {};
        if (params.id) {
            filters.id = params.id;
        }
        if (params.name) {
            filters.name = params.name;
        }
        if (params.account) {
            filters.account = params.account;
        }
        filters.isDeleted = false;

        const result = await this.userRepository.findAndCount({ where: filters });
        return {
            rows: result[0],
            count: result[1]
        };
    }

    async update(params: IUpdateUserParams): Promise<IUpdateUserResult> {
        const user = await this.findOneOrError(params.id);
        if (params.name) {
            user.name = params.name;
        }
        if (params.account) {
            user.account = params.account;
        }
        if (params.password) {
            user.password = cryptoJS
                .HmacSHA256(params.password, '10')
                .toString();
        }

        const updateUser = await this.userRepository.save(user);
        return { id: updateUser.id };
    }
}
