import { Inject, Service } from "typedi";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { config } from "../configuration";
import TaskClickedEntity from "../entities/taskClicked.entity";
import { TaskClickedLibSvc } from "../libs/taskClicked.svc";

@Service()
export class LineClickedService {
    @Inject()
    private taskClickedLibSvc: TaskClickedLibSvc;

    @Transactional({connectionName: config.mmsDatabase.database})
    async create(code: string): Promise<TaskClickedEntity> {
        const res = await this.taskClickedLibSvc.create(code);
        return res;
    }
}