import { Inject, Service } from "typedi";
import fetch from 'node-fetch';
import { ILineFollowerParams, ILineFollowerResult, ILineProfileResult, IPublishFlexImageParams, IPublishFlexPersonParams, IPublishFlexPlaceParams, IPublishFlexProductParams, IPublishFlexTextParams, IPublishImageCarouselLineParams, IPublishImagemapLineParams, IPublishLineError, IPublishLineParams, IPublishLineTemplate } from "../interfaces/line.interface";
import { TaskTargetAudienceLibSvc } from "./taskTargetAudience.lib";
import logger from "../services/logger.service";
import { TaskErrorLogLibSvc } from "./taskErrorLog.lib.svc";
import TaskTargetAudienceEntity from "../entities/taskTargetAudience.entity";
import { LineTemplateLibSvc } from "./lineTemplate.lib.svc";
import { EnumTemplate } from "../entities/lineTemplate.entity";
import { IGenerateImagemapTemplateResult, IGenerateImageTemplateResult, IGenerateTextTemplateResult, IGenerateVideoTemplateResult, IImageCarouselTemplateParams } from "../interfaces/lineTemplate.interface";
import { LineTemplateFlexLibSvc } from "./lineTempldate.flex.lib.svc";
import { LineTemplateImagemapLibSvc } from "./lineTemplate.imagemap.lib.svc";
import { IGenerateFlexPersonTemplateResult, IGenerateFlexPlaceTemplateResult, IGenerateFlexProductTemplateResult, IGenerateImageCarouseTemplateResult } from "../interfaces/lineTemplate.flex.interface";
import { TaskLibSvc } from "./task.lib.svc";
import { EnumTaskStatus } from "../entities/task.entity";
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import { TargetAudienceLibSvc } from "./targetAudience.lib.svc";

@Service()
export class LineLibSvc {
    @Inject()
    private taskLibSvc: TaskLibSvc;
    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;
    @Inject()
    private taskErrorLogLibSvc: TaskErrorLogLibSvc;
    @Inject()
    private lineTemplateLibSvc: LineTemplateLibSvc;
    @Inject()
    private lineTemplateFlexLibSvc: LineTemplateFlexLibSvc;
    @Inject()
    private lineTemplateImagemapLibSvc: LineTemplateImagemapLibSvc;
    @Inject()
    private targetAudienceLibSvc: TargetAudienceLibSvc;

    async publishByTaskTACode(code: string) {
        try {
            if (/^END:\d+$/.test(code)) {
                const res = code.split(':');
                await this.taskLibSvc.updateStatus(+res[1], EnumTaskStatus.Completed);
                return;
            }

            const taskTA = await this.taskTargetAudienceLibSvc.findOneByTaskTACode(code);
            if (!taskTA) {
                logger.warn(`publish error(taskTA not found by TaskTACode)`);
            }
            const flag = await this.publishByTaskTA(taskTA);
            if (flag) {
                await this.taskTargetAudienceLibSvc.updateSuccess(taskTA.taskId, taskTA.targetAudienceId);
            } else {
                await this.taskTargetAudienceLibSvc.updateFault(taskTA.taskId, taskTA.targetAudienceId);
            }
        } catch (err) {
            logger.error(err);
        }
    }

    async publishByTaskTA(taskTA: TaskTargetAudienceEntity) {
        try {
            let res: any = {};
            if (taskTA.task.lineTemplateId) {
                const lineTemplate = await this.lineTemplateLibSvc.findOneOrError(taskTA.task.lineTemplateId);
                res = await this.publishLineTemplate({
                    userId: taskTA.targetAudience.lineUserId,
                    code: taskTA.code,
                    lineTemplate
                });
            } else {
                res = await this.publishFlexText({
                    userId: taskTA.targetAudience.lineUserId,
                    title: taskTA.task.publishTitle,
                    content: taskTA.task.publishMessage,
                    code: taskTA.code
                });
            }

            await this.taskTargetAudienceLibSvc.updateSent(taskTA.taskId, taskTA.targetAudienceId);

            if (typeof res != "boolean") {
                await this.taskErrorLogLibSvc.create({
                    taskId: taskTA.taskId,
                    targetAudienceId: taskTA.targetAudience.id,
                    code: '',
                    message: res.message
                });
                return false;
            }

            return true;
        } catch (err) {
            await this.taskErrorLogLibSvc.create({
                taskId: taskTA.taskId,
                targetAudienceId: taskTA.targetAudience.id,
                code: '',
                message: err.message
            });
        }
        return false;
    }

    async publishMessage(userId: string, messages: any[]): Promise<boolean | IPublishLineError> {
        console.log(JSON.stringify({
            to: userId,
            messages
        }));
        const url = 'https://api.line.me/v2/bot/message/push';
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
            },
            body: JSON.stringify({
                to: userId,
                messages
            })
        })

        if (response.statusText == 'OK') {
            return true;
        } else {
            const data = await response.json();
            const err: IPublishLineError = {
                message: data.message,
                details: data.details
            }
            return err;
        }
    }

    async publishFlexText(params: IPublishFlexTextParams): Promise<boolean | IPublishLineError> {
        const messages = await this.lineTemplateFlexLibSvc.generateFlexText(params);

        return await this.publishMessage(params.userId, messages);
    }

    async publishFlexImage(params: IPublishFlexImageParams): Promise<boolean | IPublishLineError> {
        const messages = await this.lineTemplateFlexLibSvc.generateFlexImageMessage(params);

        return await this.publishMessage(params.userId, messages);
    }

    async publishImagemap(params: IPublishImagemapLineParams): Promise<boolean | IPublishLineError> {
        const messages = await this.lineTemplateImagemapLibSvc.generateImagemapMessage(params);

        return await this.publishMessage(params.userId, messages);
    }
    async publishImageCarousel(params: IPublishImageCarouselLineParams): Promise<boolean | IPublishLineError> {
        const messages = await this.lineTemplateFlexLibSvc.generateImageCarouselMessage(params);

        return await this.publishMessage(params.userId, messages);
    }

    async publishFlexProduct(params: IPublishFlexProductParams) {
        const messages = await this.lineTemplateFlexLibSvc.generateFlexProductMessage(params);

        return await this.publishMessage(params.userId, messages);
    }

    async publishFlexPlace(params: IPublishFlexPlaceParams) {
        const messages = await this.lineTemplateFlexLibSvc.generateFlexPlaceMessage(params);

        return await this.publishMessage(params.userId, messages);
    }

    async publishFlexPerson(params: IPublishFlexPersonParams) {
        const messages = await this.lineTemplateFlexLibSvc.generateFlexPersonMessage(params);

        return await this.publishMessage(params.userId, messages);
    }

    async publishVideo(params) {
        const messages = await this.lineTemplateFlexLibSvc.generateVideoMessage(params);

        return await this.publishMessage(params.userId, messages);
    }

    async publishLineTemplate(params: IPublishLineTemplate) {
        let messages: any[] = [];
        const lineTemplates = JSON.parse(params.lineTemplate.data);
        for (const lineTemplate of lineTemplates) {
            switch (lineTemplate.template) {
                case EnumTemplate.Text:
                    {
                        const data: IGenerateTextTemplateResult = lineTemplate.data;
                        const textMessage = await this.lineTemplateFlexLibSvc.generateFlexText({
                            userId: params.userId,
                            title: params.lineTemplate.name,
                            content: data.content,
                            code: params.code
                        });
                        messages = messages.concat(textMessage);
                    } break;
                case EnumTemplate.Image:
                    {
                        const data: IGenerateImageTemplateResult = lineTemplate.data;
                        const imageMessage = await this.lineTemplateFlexLibSvc.generateImageMessage({
                            imageUrl: data.imageUrl
                        });
                        messages = messages.concat(imageMessage);
                    } break;
                case EnumTemplate.ImagemapSquare:
                case EnumTemplate.ImagemapCustom:
                case EnumTemplate.Imagemap1x2:
                case EnumTemplate.Imagemap2x1:
                case EnumTemplate.Imagemap3x1:
                case EnumTemplate.Imagemap2x2:
                case EnumTemplate.Imagemap1n2Col:
                case EnumTemplate.Imagemap1n2Row:
                case EnumTemplate.Imagemap2x3:
                    {
                        const data: IGenerateImagemapTemplateResult = lineTemplate.data;
                        const imagemapMessage = await this.lineTemplateImagemapLibSvc.generateImagemapMessage({
                            title: data.title,
                            imageUrl: data.imageUrl,
                            size: data.size,
                            customHight: data.customHight,
                            actions: data.actions,
                            code: params.code
                        });
                        messages = messages.concat(imagemapMessage);
                    } break;
                case EnumTemplate.ImageCarousel:
                    {
                        const data: IGenerateImageCarouseTemplateResult = lineTemplate.data;
                        const ImageCarousemMessage = await this.lineTemplateFlexLibSvc.generateImageCarouselMessage({
                            title: data.title,
                            images: data.images,
                            code: params.code
                        });
                        messages = messages.concat(ImageCarousemMessage);
                    } break;
                case EnumTemplate.CardtypeProduct:
                    {
                        const data: IGenerateFlexProductTemplateResult = lineTemplate.data;
                        const productMessage = await this.lineTemplateFlexLibSvc.generateFlexProductMessage({
                            title: data.title,
                            products: data.products,
                            code: params.code
                        });
                        messages = messages.concat(productMessage);
                    } break;
                case EnumTemplate.CardtypePlace:
                    {
                        const data: IGenerateFlexPlaceTemplateResult = lineTemplate.data;
                        const placeMessage = await this.lineTemplateFlexLibSvc.generateFlexPlaceMessage({
                            title: data.title,
                            places: data.places,
                            code: params.code
                        });
                        messages = messages.concat(placeMessage);
                    } break;
                case EnumTemplate.CardtypePerson:
                    {
                        const data: IGenerateFlexPersonTemplateResult = lineTemplate.data;
                        const placeMessage = await this.lineTemplateFlexLibSvc.generateFlexPersonMessage({
                            title: data.title,
                            persons: data.persons,
                            code: params.code
                        });
                        messages = messages.concat(placeMessage);
                    } break;
                case EnumTemplate.Video:
                    {
                        const data: IGenerateVideoTemplateResult = lineTemplate.data;
                        const videoMessage = await this.lineTemplateFlexLibSvc.generateVideoMessage({
                            videoUrl: data.videoUrl,
                            imageUrl: data.imageUrl
                        });
                        messages = messages.concat(videoMessage);
                    } break;
            }
        }

        return await this.publishMessage(params.userId, messages);
    }

    async getPushMessageByTACode(code: string): Promise<any[]> {
        const taskTA = await this.taskTargetAudienceLibSvc.findOneByTaskTACode(code);
        const task = await this.taskLibSvc.findOneOrError(taskTA.taskId);
        const lineTemplate = await this.lineTemplateLibSvc.findOneOrError(task.lineTemplateId);
        const lineTemplates = JSON.parse(lineTemplate.data);
        const messages = await this.generateMessagesWithoutTrace(lineTemplate.name, lineTemplates, code);
        return messages;
    }
    

    async generateMessagesWithoutTrace(lineTemplateName: string, lineTemplates: any[], code: string): Promise<any[]> {
        let messages: any[] = [];
        for (const lineTemplate of lineTemplates) {
            switch (lineTemplate.template) {
                case EnumTemplate.Text:
                    {
                        const data: IGenerateTextTemplateResult = lineTemplate.data;
                        const textMessage = await this.lineTemplateFlexLibSvc.generateFlexTextWithoutTrace({
                            title: lineTemplateName,
                            content: data.content,
                        });
                        messages = messages.concat(textMessage);
                    } break;
                case EnumTemplate.Image:
                    {
                        const data: IGenerateImageTemplateResult = lineTemplate.data;
                        const imageMessage = await this.lineTemplateFlexLibSvc.generateImageMessage({
                            imageUrl: data.imageUrl
                        });
                        messages = messages.concat(imageMessage);
                    } break;
                case EnumTemplate.ImagemapSquare:
                case EnumTemplate.ImagemapCustom:
                case EnumTemplate.Imagemap1x2:
                case EnumTemplate.Imagemap2x1:
                case EnumTemplate.Imagemap3x1:
                case EnumTemplate.Imagemap2x2:
                case EnumTemplate.Imagemap1n2Col:
                case EnumTemplate.Imagemap1n2Row:
                case EnumTemplate.Imagemap2x3:
                    {
                        const data: IGenerateImagemapTemplateResult = lineTemplate.data;
                        const imagemapMessage = await this.lineTemplateImagemapLibSvc.generateImagemapMessageWithoutTrace({
                            title: data.title,
                            imageUrl: data.imageUrl,
                            size: data.size,
                            customHight: data.customHight,
                            actions: data.actions,
                            code,
                            withoutTrace: true,
                        });
                        messages = messages.concat(imagemapMessage);
                    } break;
                case EnumTemplate.ImageCarousel:
                    {
                        const data: IGenerateImageCarouseTemplateResult = lineTemplate.data;
                        const ImageCarousemMessage = await this.lineTemplateFlexLibSvc.generateImageCarouselMessage({
                            title: data.title,
                            images: data.images,
                            code,
                            isShare: true,
                            withoutTrace: true,
                        });
                        messages = messages.concat(ImageCarousemMessage);
                    } break;
                case EnumTemplate.CardtypeProduct:
                    {
                        const data: IGenerateFlexProductTemplateResult = lineTemplate.data;
                        const productMessage = await this.lineTemplateFlexLibSvc.generateFlexProductMessage({
                            title: data.title,
                            products: data.products,
                            code,
                            isShare: true,
                            withoutTrace: true,
                        });
                        messages = messages.concat(productMessage);
                    } break;
                case EnumTemplate.CardtypePlace:
                    {
                        const data: IGenerateFlexPlaceTemplateResult = lineTemplate.data;
                        const placeMessage = await this.lineTemplateFlexLibSvc.generateFlexPlaceMessage({
                            title: data.title,
                            places: data.places,
                            code,
                            isShare: true,
                            withoutTrace: true,
                        });
                        messages = messages.concat(placeMessage);
                    } break;
                case EnumTemplate.CardtypePerson:
                    {
                        const data: IGenerateFlexPersonTemplateResult = lineTemplate.data;
                        const placeMessage = await this.lineTemplateFlexLibSvc.generateFlexPersonMessage({
                            title: data.title,
                            persons: data.persons,
                            code,
                            isShare: true,
                            withoutTrace: true,
                        });
                        messages = messages.concat(placeMessage);
                    } break;
                case EnumTemplate.Video:
                    {
                        const data: IGenerateVideoTemplateResult = lineTemplate.data;
                        const videoMessage = await this.lineTemplateFlexLibSvc.generateVideoMessage({
                            videoUrl: data.videoUrl,
                            imageUrl: data.imageUrl
                        });
                        messages = messages.concat(videoMessage);
                    } break;
            }
        }
        return messages;
    }

    async followerIds(params: ILineFollowerParams): Promise<void> {
        try{
            const url = new URL('https://api.line.me/v2/bot/followers/ids');

            if(params.startlineId) {
                url.search = new URLSearchParams({
                    start: params.startlineId
                }).toString();
            }

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
                },
            })
    
            const data = await response.json();
            if (data.message) {
                throw new Error(data.message);
            } else {
                for (const userId of data.userIds) {
                    await this.targetAudienceLibSvc.createByLineId(userId);
                    const profile = await this.profile(userId);
                    await this.targetAudienceLibSvc.updateByLineId({
                        ...profile,
                        lineId: userId,
                    });
                }
                if (data.next) {
                    await this.followerIds({ startlineId: data.next });
                }
            }
        } catch (err) {
            throw new AppError({
                message: err.message,
                code: ResultCode.serverError,
            }); 
        }
    }

    async profile(lineId: string): Promise<ILineProfileResult> {
        try {
            const url = new URL(`https://api.line.me/v2/bot/profile/${lineId}`);

            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${process.env.CHANNEL_ACCESS_TOKEN}`
                },
            })

            const data = await response.json();
            if (data.message) {
                throw new Error(data.message);
            } 
            
            return { ...data }
        } catch (err) {
            throw new AppError({
                message: err.message,
                code: ResultCode.serverError,
            });
        }
    }

    async create(userId: string) {
        await this.targetAudienceLibSvc.createByLineId(userId);
        const profile = await this.profile(userId);
        await this.targetAudienceLibSvc.updateByLineId({
            ...profile,
            lineId: userId,
        });
    }
}