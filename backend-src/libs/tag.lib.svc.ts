import { Service } from "typedi";
import { ISearchResult } from "../interfaces/base.interface";
import { BaseService } from "./base.lib.svc";
import { typeChecker } from "camel-toolbox";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { TagRepository } from "../repositories/tag.repo";
import TagEntity from "../entities/tag.entity";
import { ICreateTagParams, ISearchTagParams } from "../interfaces/tag.interface";
import { config } from "../configuration";

@Service()
export class TagLibSvc extends BaseService<TagEntity>{
    @InjectRepository(config.mmsDatabase.database)
    private readonly tagRepository: TagRepository;

    async findOneOrError(id: number): Promise<TagEntity> {
        const tag = await this.tagRepository.findOne({
            id,
            isDeleted: false
        })
        if (typeChecker.isNullOrUndefinedObject(tag)) {
            throw new AppError({ message: '查無此標籤', code: ResultCode.clientError })
        }
        return tag;
    }

    async search(params: ISearchTagParams): Promise<ISearchResult<TagEntity[]>> {
        const [rows, count] = await this.tagRepository.findAndCount({
            where: {
                taskId: params.taskId,
                name: params.name,
                isDeleted: false,
            },
            skip: params.offset,
            take: params.limit
        })
        return { rows, count };
    }

    async create(params: ICreateTagParams): Promise<TagEntity> {
        await this.validateObject(ICreateTagParams, params);
        let tag = new TagEntity();
        tag.companyId = params.companyId;
        tag.taskId = params.taskId;
        tag.name = params.name;
        return await this.tagRepository.save(tag);
    }
}