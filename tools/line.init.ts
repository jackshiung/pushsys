import { createConnection } from 'typeorm';
import * as path from 'path';
import * as dotenvFlow from 'dotenv-flow';
const dotenv = dotenvFlow.config();
process.env.NODE_ENV = dotenv.parsed!.NODE_ENV;
import fetch from 'node-fetch';
import TargetAudienceEntity from '../backend-src/entities/targetAudience.entity';

const limit = process.argv.slice(2);

interface ILineProfileResult {
    userId: string;
    displayName: string;
    pictureUrl: string;
    language: string;
}

interface IUpdateTargetAudienceByLineIdParams extends ILineProfileResult {
    lineId: string;
}

interface ILineFollowerParams {
    limit?: number;
    startlineId?: string;
}

const config = {
    mmsDatabase: {
        host: process.env.DB_HOST,
        port: +process.env.DB_PORT!,
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    },
    logDatabase: {
        host: process.env.LOG_DB_HOST,
        port: +process.env.LOG_DB_PORT!,
        username: process.env.LOG_DB_USER,
        password: process.env.LOG_DB_PASSWORD,
        database: process.env.LOG_DB_NAME,
    },
};

let connection;

async () => {
    connection = await createConnection({
        name: config.mmsDatabase.database,
        type: 'mysql',
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
};

async function followerIds(params: ILineFollowerParams): Promise<void> {
    try {
        const url = new URL('https://api.line.me/v2/bot/followers/ids');
        let urlParams: any = {};
        if (params.startlineId) {
            console.log('start', params.startlineId);
            urlParams.start = params.startlineId;
        }
        if (params.limit) {
            console.log('limit', params.limit);
            urlParams.limit = params.limit;
        }
        url.search = new URLSearchParams(urlParams).toString();

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
            },
        });

        const data = await response.json();
        if (data.message) {
            throw new Error(data.message);
        } else {
            for (const userId of data.userIds) {
                await createByLineId(userId);
                const profile = await getProfile(userId);
                if (profile) {
                    await updateByLineId({
                        ...profile,
                        lineId: userId,
                    });
                }
            }
            if (data.next) {
                await followerIds({ startlineId: data.next });
            }
        }
    } catch (err) {
        console.log(err);
    }
}

async function getProfile(lineId: string): Promise<ILineProfileResult | null> {
    try {
        const url = new URL(`https://api.line.me/v2/bot/profile/${lineId}`);

        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`,
            },
        });

        const data = await response.json();
        if (data.message) {
            throw new Error(data.message);
        }

        return { ...data };
    } catch (err) {
        return null;
    }
}

async function createByLineId(userId: string) {
    const targetAudienceRepository =
        connection.getRepository(TargetAudienceEntity);
    const targetAudience = await targetAudienceRepository.findOne({
        where: [{ lineUserId: userId }],
    });
    if (targetAudience) {
        targetAudience.isDeleted = false;
        const updateTA = await targetAudienceRepository.save(targetAudience);
        return updateTA;
    } else {
        let newTargetAudience = new TargetAudienceEntity();
        newTargetAudience.companyId = 1;
        newTargetAudience.lineUserId = userId;

        const newTA = await targetAudienceRepository.save(newTargetAudience);
        return newTA;
    }
}

async function updateByLineId(params: IUpdateTargetAudienceByLineIdParams) {
    const targetAudienceRepository =
        connection.getRepository(TargetAudienceEntity);
    const targetAudience = await targetAudienceRepository.findOne({
        where: { lineUserId: params.lineId },
    });
    if (targetAudience) {
        targetAudience.displayName = params.displayName;
        targetAudience.pictureUrl = params.pictureUrl;
        targetAudience.isDeleted = false;
        const updateTA = await targetAudienceRepository.save(targetAudience);
        return updateTA;
    }
    return null;
}

followerIds({ limit: +limit[0] });
