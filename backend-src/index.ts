import "reflect-metadata";
import { initializeTransactionalContext } from 'typeorm-transactional-cls-hooked';
import express from "express";
import { config } from "./configuration";
import expressHandlebars from "express-handlebars"
import * as path from "path";
import pageRouters from "./page-routers";
import apiRouters from "./api-routers";
import hookRouters from "./hook-router";
import { useContainer } from 'typeorm';
import { Container } from "typedi";
import { mysqlDB } from "./databases/mysql.database";
import { endMiddlewares, startMiddlewares } from "./middlewares";
import MqSenderService from "./services/sendQueue.mq.service";
import mq from "./libs/mq.lib.svc";
import { AWS } from './utils/aws.util';
import { JWT } from "./utils/jwt.util";
import cookieParser from "cookie-parser";
import { proxyHandler } from "./client-proxy";

start();

async function start() {
    const app = express();

    // 設定 type orm di container
    useContainer(Container);

    // 建立 Db 連線
    await mysqlDB.initial();

    // 初始化 transactional 
    initializeTransactionalContext();

    //init jwt
    JWT.initialize(config.jwt);

    AWS.initialize({
        key: process.env.AWS_KEY,
        secret: process.env.AWS_SECRET
    });

    app.use('/public', express.static(path.resolve(__dirname, '../public')));

    // set view
    app.engine('handlebars', expressHandlebars({ defaultLayout: "" }));
    app.set('view engine', 'handlebars');
    app.set('views', path.join(__dirname, '../views'))

    app.use('/api', ...startMiddlewares, apiRouters, ...endMiddlewares);

    app.use('/proxy', cookieParser(), proxyHandler)

    app.use('/hook', ...startMiddlewares, hookRouters);

    // set page router
    app.use('/', cookieParser(), pageRouters)

    app.listen(config.appPort, () => {
        console.log(process.env.NODE_ENV);
        console.log(`server listen on ${config.appPort}`)
    })

    await mq.init();

    const mqSenderService = Container.get(MqSenderService);

    setInterval(async () => {
        await mqSenderService.sendTaskTAs();
    }, 5000);

    process.on('unhandledRejection', console.dir);
}
