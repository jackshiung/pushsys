import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { config } from "../configuration";

const winstonLogger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.DailyRotateFile({
            ...config.logger,
            zippedArchive: true,
        })
    ],
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.simple()
    )
});

// 在開發模式時, 將 log 訊息多輸出到 console 中
if (process.env.NODE_ENV !== 'production') {
    winstonLogger.add(new winston.transports.Console({
        // simple 格式 : `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
        format: winston.format.simple(),
    }));
}

class Logger {
    info(message: string): void {
        winstonLogger.log('info', message);
    }

    warn(message: string): void {
        winstonLogger.log('warn', message);
    }

    error(err: any): void {
        winstonLogger.log('error', err.message);
    }
}

const logger = new Logger;
export default logger;