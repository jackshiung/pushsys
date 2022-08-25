import { Inject, Service } from 'typedi';
import { TaskLibSvc } from '../libs/task.lib.svc';
import moment from 'moment';
import { EnumTaskStatus } from '../entities/task.entity';
import mq from '../libs/mq.lib.svc';
import { TaskTargetAudienceLibSvc } from '../libs/taskTargetAudience.lib';

@Service()
export default class MqSenderService {
    @Inject()
    private taskLibSvc: TaskLibSvc;
    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;

    async sendTaskTAs() {
        const task = await this.taskLibSvc.findOnePending();

        if (!task) { return };

        if (moment().diff(task.startTime) < 0) { return };

        await this.taskLibSvc.updateStatus(task.id, EnumTaskStatus.Processing);

        const taskTAs = await this.taskTargetAudienceLibSvc.findNotSendByTaskId(task.id);
        const channel = (process.env.NODE_ENV === 'production') ? 'line' : 'line-dev';
        for (const taskTA of taskTAs) {
            await mq.send(channel, taskTA.code);
        }
        await mq.send(channel, `END:${task.id}`);
    }
}