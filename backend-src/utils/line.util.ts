import line from '@line/bot-sdk';

let client: line.Client;
namespace LINE {
    export function initialize() {
        if (!client) {
            client = new line.Client({
                channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN
            });
        }
    }

    export async function pushText(userId: string, message: line.TextMessage) {
        const res = await client.pushMessage(userId, message);
        return res;
    }

    export async function multicastText(userIds: string[], message: line.TextMessage) {
        const res = await client.multicast(userIds, message);
        return res;
    }
}