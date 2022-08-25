import Container from "typedi";
import { useContainer } from "typeorm";
import { initializeTransactionalContext } from "typeorm-transactional-cls-hooked";
import { mysqlDB } from "./databases/mysql.database";
import mq from "./libs/mq.lib.svc";
import MqService from './services/mq.service';

process.on('uncaughtException', (error) => {
    console.log(error);
});

async function run() {
    // 設定 type orm di container
    useContainer(Container);

    // 建立 Db 連線
    await mysqlDB.initial();

    // 初始化 transactional 
    initializeTransactionalContext();

    await mq.init();

    //TODO: 分不同任務收
    const channel = (process.env.NODE_ENV === 'production') ? 'line' : 'line-dev';
    await MqService.LineMqService.publish(channel);
    // await MqService.LineNotificationMqService.publish('line_notification');
    // await MqService.MessengerMqService.publish('messenger');
    // await MqService.MessengerNotificationMqService.publish('messenger_notification');
    console.log('queue', channel);
}
run();