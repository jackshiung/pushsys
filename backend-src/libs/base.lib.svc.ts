import { AppError } from './../view-models/error.vm';
import { ResultCode } from '../view-models/result.vm';
import { ClassConstructor, plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { EntityManager } from "typeorm";
import { IBaseSearchParams, ISearchResult } from "../interfaces/base.interface";


export abstract class BaseLibSvc {
    protected entityManager: EntityManager;
    constructor(protected readonly context: BaseLibSvcContext) {
        this.entityManager = context.entityManager;
    }
}

export interface BaseLibSvcContext {
    entityManager?: EntityManager
}

export abstract class BaseService<T> {
    abstract findOneOrError(id: number): Promise<T>;
    abstract search(params: IBaseSearchParams): Promise<ISearchResult<T[]>>;

    async validateObject<T, V>(cls: ClassConstructor<T>, plain: V): Promise<void> {

        const parsedClass = plainToClass(cls, plain);

        const errors = await validate(<Object>parsedClass);

        if (errors.length === 0) {
            return;
        }

        throw new AppError({ message: errors.toString(), code: ResultCode.clientError })
    }
}