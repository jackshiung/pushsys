import { createConnection } from "typeorm";
import * as path from "path";
import * as dotenvFlow from 'dotenv-flow';
import UserEntity from '../backend-src/entities/user.entity';
import CompanyEntity from '../backend-src/entities/company.entity';
import cryptoJS from 'crypto-js';
const dotenv = dotenvFlow.config();
process.env.NODE_ENV = dotenv.parsed!.NODE_ENV;

(async () => {
    const config = {
        mmsDatabase: {
            host: process.env.DB_HOST,
            port: +(process.env.DB_PORT || 3306),
            username: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        },
        logDatabase: {
            host: process.env.LOG_DB_HOST,
            port: +(process.env.LOG_DB_PORT || 3306),
            username: process.env.LOG_DB_USER,
            password: process.env.LOG_DB_PASSWORD,
            database: process.env.LOG_DB_NAME
        },
    }

    const connection1 = await createConnection({
        name: config.mmsDatabase.database,
        type: "mysql",
        host: config.mmsDatabase.host,
        port: config.mmsDatabase.port,
        username: config.mmsDatabase.username,
        password: config.mmsDatabase.password,
        database: config.mmsDatabase.database,
        entities: [path.resolve(__dirname, '../backend-src/entities/*.ts')],
        synchronize: true,
        logging: true,
        legacySpatialSupport: false,
    });
    await connection1.synchronize();

    await connection1.transaction(async (entityManager) => {
        let companyRepository = entityManager.getRepository(CompanyEntity);
        const companyCount = await companyRepository.count();
        let companyId;
        if (companyCount == 0) {
            const companyEntity = new CompanyEntity();
            companyEntity.name = 'default';
            const newCompany = await companyRepository.save(companyEntity, {
                transaction: true,
            });
            companyId = newCompany.id;
        } else {
            const company = await companyRepository.findOne();
            if (company) { 
                companyId = company.id;
            }
        }

        let userRepository = entityManager.getRepository(UserEntity);
        const userCount = await userRepository.count();
        if (userCount == 0) {
            const userEntity = new UserEntity();
            userEntity.companyId = companyId,
                userEntity.name = 'admin';
            userEntity.account = 'admin';
            userEntity.password = cryptoJS.HmacSHA256('1234', '10').toString();
            userEntity.isDeleted = false;
            await userRepository.save(userEntity, {
                transaction: true,
            });
        }
    });

    await connection1.close();

    const connection2 = await createConnection({
        name: config.logDatabase.database,
        type: "mysql",
        host: config.logDatabase.host,
        port: config.logDatabase.port,
        username: config.logDatabase.username,
        password: config.logDatabase.password,
        database: config.logDatabase.database,
        entities: [path.resolve(__dirname, '../backend-src/entities/*.ts')],
        synchronize: true,
        logging: true,
        legacySpatialSupport: false,
    });


    await connection2.synchronize();
    await connection2.close();
})().catch(error => console.log('caught', error));

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error);
    process.exit(1);
});