import { Inject, Service } from "typedi";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { config } from "../configuration";
import { IBulkCreateTaskTargetAudienceByIdParams } from "../interfaces/taskTargetAudience.interface";
import { TaskTargetAudienceLibSvc } from "../libs/taskTargetAudience.lib";

@Service()
export class TaskTargetAudienceService {
    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;

    @Transactional({ connectionName: config.mmsDatabase.database })
    async bulkCreate(params: IBulkCreateTaskTargetAudienceByIdParams) {
        return await this.taskTargetAudienceLibSvc.bulkCreateById(params);
    }

    @Transactional({ connectionName: config.mmsDatabase.database })
    async deleteAll(taskId: number) {
        return await this.taskTargetAudienceLibSvc.deleteAll(taskId);
    }

    @Transactional({connectionName: config.mmsDatabase.database})
    async updateExportByTACode(params: {code: string, isExport: boolean}): Promise<void> {
        const res = await this.taskTargetAudienceLibSvc.updateExportByTACode(params);
    }
}