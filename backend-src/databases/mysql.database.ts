import { config } from '../configuration'
import { Connection, createConnections, getConnection } from "typeorm";
import * as path from "path";

class MysqlDB {
    private _connections: Connection[];
    private isInit: boolean = false;
    async initial(): Promise<void> {

        if (this.isInit) {
            return;
        }

        this._connections = await createConnections([{
            name: config.mmsDatabase.database,
            type: "mysql",
            host: config.mmsDatabase.host,
            port: config.mmsDatabase.port,
            username: config.mmsDatabase.username,
            password: config.mmsDatabase.password,
            database: config.mmsDatabase.database,
            entities: [path.resolve(__dirname, '../entities/*.js')],
            synchronize: false,
            logging: false,
            legacySpatialSupport: false,
        }, {
            name: config.logDatabase.database,
            type: "mysql",
            host: config.logDatabase.host,
            port: config.logDatabase.port,
            username: config.logDatabase.username,
            password: config.logDatabase.password,
            database: config.logDatabase.database,
            entities: [path.resolve(__dirname, '../entities/*.js')],
            synchronize: false,
            logging: false,
            legacySpatialSupport: false,
        }]);
        this.isInit = true;
    }

    get connections(): Connection[] {
        if (!this._connections) {
            throw new Error('createConnection not ready');
        }
        return this._connections;
    }
}

export const mysqlDB = new MysqlDB();