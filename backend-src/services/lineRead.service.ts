import { Inject, Service } from "typedi";
import { Transactional } from "typeorm-transactional-cls-hooked";
import { config } from "../configuration";
import TaskReadEntity from "../entities/taskRead.entity";
import { TaskReadLibSvc } from "../libs/taskRead.svc";

@Service()
export class LineReadService {
    @Inject()
    private taskReadLibSvc: TaskReadLibSvc;

    @Transactional({connectionName: config.mmsDatabase.database})
    async create(code: string): Promise<TaskReadEntity> {
        const res = await this.taskReadLibSvc.create(code);
        return res;
    }
}