import { Router } from 'express';
import { Client, TextMessage } from '@line/bot-sdk';
import Container from 'typedi';
import { AppRequest } from '../view-models/http.vm';
import { LineReadService } from '../services/lineRead.service';
import { TaskTargetAudienceService } from '../services/taskTargetAudience.service';
import { TargetAudienceService } from '../services/targetAudience.service';
import { Format } from '../utils/format.util';
import { LineClickedService } from '../services/lineClicked.service';
import { LineLibSvc } from '../libs/line.lib.svc';
import fetch from 'node-fetch';

const router = Router();

// create LINE SDK config from env variables
const lineConfig = {
    channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.CHANNEL_SECRET || '',
};
// create LINE SDK client
const client = new Client(lineConfig);

/**
 * @name line-webhook
 * @path [POST] /hook/line/webhook
 */
router.post('/line/webhook', (req, res) => {
    Promise.all(req.body.events.map(handleEvent))
        .then((result) => res.json(result))
        .catch((err) => {
            console.error(err);
            res.status(500).end();
        });
    Promise.resolve(
        dataTransfer(req.body).catch((err) => {
            console.error(err);
            res.status(500).end();
        })
    );
});

/**
 * @name LINE已讀圖片
 * @path [GET]   /hook/line/read/:code
 **/
router.get('/line/read/:code', async (req: AppRequest, res, next) => {
    try {
        const code = req.params.code;
        const lineReadService = Container.get(LineReadService);
        await lineReadService.create(code);
        const taskTargetAudienceLibService = Container.get(
            TaskTargetAudienceService
        );
        await taskTargetAudienceLibService.updateExportByTACode({
            code,
            isExport: false,
        });
        console.log('line read from', code);
        res.status(200);
        next();
    } catch (err) {
        next(err);
    }
});

// clicked
/**
 * @name 點擊連結
 * @path [GET]  /hook/line/clicked?code={{code}}&linkUrl={{linkUrl}}
 **/
router.get('/line/clicked', async (req: AppRequest, res, next) => {
    try {
        const code = Format.tryGetString(req.query.code, null);
        const linkUrl = Format.tryGetString(req.query.linkUrl, null);
        const lineClickedService = Container.get(LineClickedService);
        await lineClickedService.create(code);
        const taskTargetAudienceLibService = Container.get(
            TaskTargetAudienceService
        );
        await taskTargetAudienceLibService.updateExportByTACode({
            code,
            isExport: false,
        });
        res.redirect(linkUrl);
        next();
    } catch (err) {
        next(err);
    }
});

async function handleEvent(event: any): Promise<any> {
    const userId = event.source.userId;
    console.log('handleEvent', userId);

    if (event.type == 'follow') {
        console.log('follow', userId);
        const lineLibSvc = Container.get(LineLibSvc);
        return Promise.resolve(lineLibSvc.create(userId));
    }

    if (event.type == 'unfollow') {
        console.log('unfollow', userId);
        const targetAudienceService = Container.get(TargetAudienceService);
        return Promise.resolve(targetAudienceService.unfollowByLineId(userId));
    }

    if (event.message.text == 'YMAI') {
        const echo: TextMessage = { type: 'text', text: event.source.userId };
        return client.replyMessage(event.replyToken, echo);
    }
}

async function dataTransfer(body: any): Promise<any> {
    const url = process.env.DATA_TRANSFER_API;
    if (!url) {
        return;
    }
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body,
    });

    if (response.statusText == 'OK') {
        return true;
    } else {
        const data = await response.json();
        throw data;
    }
}

export default router;
