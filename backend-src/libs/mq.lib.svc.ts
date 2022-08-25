import amqp, { Options } from 'amqplib';
import { config } from '../configuration';

class MqLibSvc {
    ch: amqp.Channel;
    async init() {
        const conn = await amqp.connect(config.mq);
        this.ch = await conn.createChannel();
        await this.ch.prefetch(1, false);
    }

    async send(queueName: string, message: string) {
        await this.ch.assertQueue(queueName, { durable: true });
        await this.ch.sendToQueue(queueName, Buffer.from(message));
    }
}

const mqLibSvc = new MqLibSvc()

export default mqLibSvc;