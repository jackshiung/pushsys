import Container, { Inject, Service } from 'typedi';
import { LineLibSvc } from '../libs/line.lib.svc';
import mq from '../libs/mq.lib.svc';
import logger from './logger.service';

@Service()
export class LineMqService {
    async publish(queue: string) {
        try {
            const ch = mq.ch;
            const message = await ch.consume(queue, async function (msg) {
                if (msg) {
                    const key = msg.content.toString();
                    const lineLibSvc = Container.get(LineLibSvc);
                    await lineLibSvc.publishByTaskTACode(key);
                    await ch.ack(msg);
                }
            }, {
                noAck: false,
                consumerTag: queue
            });
            console.log(`message`, message);
        } catch (err) {
            logger.error(err);
        }
    }
}
const lineMqService = Container.get(LineMqService);
export default lineMqService;