import { Options } from 'amqplib';
import * as dotenvFlow from 'dotenv-flow';
import { JWT } from '../utils/jwt.util';
const dotenv = dotenvFlow.config();
process.env.NODE_ENV = dotenv.parsed!.NODE_ENV;

export interface DbConfiguration {
    host: string
    port: number
    username: string
    password: string
    database: string
}

export interface Configuration {
    appPort: number;
    appTitle: string;
    hookHost: string;
    mmsDatabase: DbConfiguration;
    logDatabase: DbConfiguration;
    sms: {
        url: string;
        lineUrl: string;
    }
    mq: Options.Connect;
    logger: {
        dirname: string;
        filename: string;
        maxFiles: string;
    },
    cdp: {
        authorization: string;
        cdpAimapiSystemCode: string;
    }
    jwt: JWT.IJWTOptions;
    aim: {
        dev: {
            chatisfyReportUrl: string;
            searchUrl: string;
            createUrl: string;
            updateUrl: string;
        },
        prod: {
            chatisfyReportUrl: string;
            searchUrl: string;
            createUrl: string;
            updateUrl: string;
        }
    };
    shareUrl: string;
    lineAtUrl: string;
}

export const config: Configuration = {
    appPort: getPort(),
    appTitle: process.env.APP_TITLE_NAME,
    hookHost: process.env.HOOK_HOST,
    mmsDatabase: {
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    },
    logDatabase: {
        host: process.env.LOG_DB_HOST,
        port: +process.env.LOG_DB_PORT,
        username: process.env.LOG_DB_USER,
        password: process.env.LOG_DB_PASSWORD,
        database: process.env.LOG_DB_NAME
    },
    sms: {
        url: 'http://api.every8d.com/API21/HTTP/sendSMS.ashx', //HTTP(http://api.every8d.com/) HTTPS(https://api.e8d.tw/)
        lineUrl: 'http://api.e8d.tw/ent_linepnp/API21/HTTP/LinePNPSend.ashx'
    },
    mq: {
        hostname: process.env.MQ_HOST,
        port: process.env.MQ_PORT ? Number(process.env.MQ_PORT) : undefined,
        username: process.env.MQ_USER,
        password: process.env.MQ_PASSWORD
    },
    logger: {
        dirname: __dirname + '/../../logs',
        filename: `%DATE%.log`,
        maxFiles: '30d'
    },
    cdp: {
        authorization: process.env.CDP_HEARER_AUTHORIZATION,
        cdpAimapiSystemCode: 'chatisfy'
    },
    jwt: {
        secret: 'jj-mms-api',
        expiresIn: 60 * 30,
    },
    aim: {
        dev: {
            chatisfyReportUrl: 'https://aimuat-iroo.azurewebsites.net/api/v1.11/iroo/chatisfyReport',
            searchUrl: 'https://aimuat-iroo.azurewebsites.net/api/AIMAPI/QueryContact',
            createUrl: 'https://aimuat-iroo.azurewebsites.net/api/AIMAPI/CreateContact',
            updateUrl: 'https://aimuat-iroo.azurewebsites.net/api/AIMAPI/UpdateContact'
        },
        prod: {
            chatisfyReportUrl: 'https://aimcdp-iroo.esi-tech.net/api/v1.11/iroo/chatisfyReport',
            searchUrl: 'https://aimcdp-iroo.esi-tech.net/api/AIMAPI/QueryContact', 
            createUrl: 'https://aimcdp-iroo.esi-tech.net/api/AIMAPI/CreateContact',
            updateUrl: 'https://aimcdp-iroo.esi-tech.net/api/AIMAPI/UpdateContact'
        }
    },
    shareUrl: `line://app/${process.env.LIFF_ID}`,
    lineAtUrl: `https://line.me/R/oaMessage/${process.env.LINE_AT_ID}`
}

function getPort(): number {

    if (process.env.PORT) {
        return +process.env.PORT
    }

    if (process.env.APP_PORT) {
        return +process.env.APP_PORT
    }

    return 8080;
}
