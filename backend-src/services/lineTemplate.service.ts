import { Inject, Service } from "typedi";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { config } from "../configuration";
import LineTemplateEntity from "../entities/lineTemplate.entity";
import { ISearchResult } from "../interfaces/base.interface";
import { ICreateLineTemplateParams, ICreateLineTemplateResult, ISearchLineTemplateParams, ISearchLineTemplatesResult, IUpdateLineTemplateParams, IUpdateLineTemplateResult } from "../interfaces/lineTemplate.interface";
import { LineLibSvc } from "../libs/line.lib.svc";
import { LineTemplateLibSvc } from "../libs/lineTemplate.lib.svc";
import { TaskLibSvc } from "../libs/task.lib.svc";

@Service()
export class LineTemplateService {
    @Inject()
    private lineTemplateLibSvc: LineTemplateLibSvc;
    @Inject()
    private taskLibSvc: TaskLibSvc;
    @Inject()
    private lineLibSvc: LineLibSvc;

    async findAll(params: ISearchLineTemplateParams): Promise<ISearchResult<LineTemplateEntity[]>> {
        const lineTemplates = await this.lineTemplateLibSvc.search(params);
        return lineTemplates;
    }

    async findOne(id: number): Promise<ISearchLineTemplatesResult> {
        const lineTemplates = await this.lineTemplateLibSvc.findOneOrError(id);
        return await this.lineTemplateLibSvc.generateResult(lineTemplates);
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async create(params: ICreateLineTemplateParams): Promise<ICreateLineTemplateResult> {
        const res = await this.lineTemplateLibSvc.createTemplates({
            companyId: params.companyId,
            name: params.name,
            messages: params.messages
        });
        return res;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async update(params: IUpdateLineTemplateParams): Promise<IUpdateLineTemplateResult> {
        const res = await this.lineTemplateLibSvc.updateTemplates({
            companyId: params.companyId,
            templateId: params.templateId,
            name: params.name,
            messages: params.messages
        });
        return res;
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async delete(taskId: number): Promise<LineTemplateEntity> {
        const task = await this.lineTemplateLibSvc.delete(taskId);
        return task;
    }
}