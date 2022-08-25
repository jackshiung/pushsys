import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import { useContainer } from 'typeorm';
import { Container } from "typedi";
import { mysqlDB } from "./databases/mysql.database";
import ScheduleService from "./services/schedule";
import logger from "./services/logger.service";
import cron from 'node-schedule';

start();

async function start() {
    // 設定 type orm di container
    useContainer(Container);

    // 建立 Db 連線
    await mysqlDB.initial();

    // 初始化 transactional 
    initializeTransactionalContext();

    const scheduleService = Container.get(ScheduleService);

    cron.scheduleJob(process.env.CDP_AIMAPI_TIME, async () => {
        logger.info('starting [upload TA to cdp]')
        try {
            await scheduleService.uploadTAs();
            logger.info('success [upload TA to cdp]')
        } catch (error) {
            logger.error(error);
        }
    });

    cron.scheduleJob(process.env.CDP_CHATISFY_REPORT_TIME, async () => {
        logger.info('starting [upload chatisfy report to cdp]')
        try {
            await scheduleService.uploadTaskResult();
            logger.info('success [upload chatisfy report to cdp]')
        } catch (error) {
            logger.error(error);
        }
    });

    console.log('scheduleJob start');
}

process.on('uncaughtException', (error) => {
    console.log(error);
});