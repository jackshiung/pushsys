import { Inject, Service } from "typedi";
import { EnumTaskTargetAudienceChannel } from "../entities/taskTargetAudience.entity";
import { LineLibSvc } from "./line.lib.svc";
import { TaskTargetAudienceLibSvc } from "./taskTargetAudience.lib";

@Service()
export class PublishLibSvc {
    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;
    @Inject()
    private lineLibSvc: LineLibSvc;

    async publishByTaskTA(taskTargetAudienceCode: string) {
        const taskTA = await this.taskTargetAudienceLibSvc.findOneByTaskTACode(taskTargetAudienceCode);
        switch (taskTA.channel) {
            case EnumTaskTargetAudienceChannel.Line:
                await this.lineLibSvc.publishByTaskTA(taskTA);
                break;
        }
    }
}