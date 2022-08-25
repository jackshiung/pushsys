import { Inject, Service } from "typedi";
import { InjectRepository } from "typeorm-typedi-extensions";
import { CDPTargetAudienceRepository } from "../repositories/cdpTA.repo";
import { config } from "../configuration";
import { ISearchResult } from "../interfaces/base.interface";
import CDPTargetAudienceEntity from "../entities/cdpTargetAudience.entity";
import { EnumExportTaskResultChannelType, EnumExportTaskResultDeliveryStatus, IChatisfyHookData, IExportTaskResultDto, ISearchCDPTargetAudienceParams } from "../interfaces/cdp.interface";
import moment from "moment";
import { TaskLibSvc } from "./task.lib.svc";
import { TaskClickedLibSvc } from "./taskClicked.svc";
import fetch from 'node-fetch';
import { AppError } from "../view-models/error.vm";
import { ResultCode } from "../view-models/result.vm";
import logger from "../services/logger.service";
import TargetAudienceEntity from "../entities/targetAudience.entity";
import { CDP } from "../utils/cpd.util";
import * as _ from 'lodash';
import { TaskReadLibSvc } from "./taskRead.svc";
import { TaskTargetAudienceLibSvc } from "./taskTargetAudience.lib";

@Service()
export class CDPLibSvc {
    @InjectRepository(config.mmsDatabase.database)
    private readonly cdpTargetAudienceRepository: CDPTargetAudienceRepository;

    @Inject()
    private taskTargetAudienceLibSvc: TaskTargetAudienceLibSvc;
    @Inject()
    private taskClickedLibSvc: TaskClickedLibSvc;
    @Inject()
    private taskReadLibSvc: TaskReadLibSvc;

    async search(params: ISearchCDPTargetAudienceParams): Promise<ISearchResult<CDPTargetAudienceEntity[]>> {
        const filters: any = {};
        if (params.id) {
            filters.id = params.id;
        }
        if (params.isExport) {
            filters.isExport = params.isExport;
        }
        if (params.platform) {
            filters.platform = params.platform;
        }
        if (params.botId) {
            filters.botId = params.botId;
        }
        if (params.pageId) {
            filters.pageId = params.pageId;
        }
        if (params.psid) {
            filters.psid = params.psid;
        }
        const result = await this.cdpTargetAudienceRepository.findAndCount({
            where: filters,
            order: {
                createDate: "ASC"
            }
        })

        return {
            rows: result[0],
            count: result[1]
        };
    }

    async uploadTaskResultToCDP(): Promise<number> {
        const isExportData: { taskId: number, targetAudienceId: number }[] = []
        const earportData: IExportTaskResultDto[] = [];

        const taskTargetAudiences = await this.taskTargetAudienceLibSvc.findNotExport();

        for (const taskTargetAudience of taskTargetAudiences) {
            const clicked = await this.taskClickedLibSvc.findOneByTaskAndTA(taskTargetAudience.taskId, taskTargetAudience.targetAudienceId);
            const read = await this.taskReadLibSvc.findOneByTaskAndTA(taskTargetAudience.taskId, taskTargetAudience.targetAudienceId);
            if (taskTargetAudience.isSuccess && (!clicked && !read)) {
                //未讀未點擊不上傳
                continue;
            }
            let status = EnumExportTaskResultDeliveryStatus.IN_QUEUE;
            if (taskTargetAudience.isSent && taskTargetAudience.isSuccess) {
                status = EnumExportTaskResultDeliveryStatus.SENT;
            }
            if (taskTargetAudience.isSent && !taskTargetAudience.isSuccess) {
                status = EnumExportTaskResultDeliveryStatus.FAILURE;
            }
            earportData.push({
                MessageId: `${taskTargetAudience.taskId}`,
                LineUId: taskTargetAudience.targetAudience.lineUserId,
                DeliveryStatus: status,
                ChannelType: EnumExportTaskResultChannelType.LINE,
                DeliveryTime: moment().format('YYYY-MM-DD HH:mm:ss'),
                IsClick: clicked ? 1 : 0,
                ClickTime: clicked ? moment(clicked.createDate).format('YYYY-MM-DD HH:mm:ss') : null,
                IsRead: read ? 1 : 0,
                ReadTime: read ? moment(read.createDate).format('YYYY-MM-DD HH:mm:ss') : null,
                ErrorCode: ''
            })
            isExportData.push({
                taskId: taskTargetAudience.taskId,
                targetAudienceId: taskTargetAudience.targetAudienceId
            })
        }
        if (earportData.length == 0) {
            return 0;
        }

        if (earportData.length <= 1000) {
            await this.sendTaskResultToCDP(earportData);
        } else {
            for (let index = 0; index * 1000 < earportData.length; index++) {
                let end = (index + 1) * 1000;
                if (end > earportData.length) {
                    end = earportData.length
                }
                const data = _.slice(earportData, index * 1000, end)
                await this.sendTaskResultToCDP(data);
            }
        }

        for (const data of isExportData) {
            await this.taskTargetAudienceLibSvc.updateExport({ ...data, isExport: true });
        }

        return earportData.length;
    }

    private async sendTaskResultToCDP(earportData: IExportTaskResultDto[]): Promise<{ success: boolean, message: string }> {
        const uslString = (process.env.NODE_ENV === 'production') ? config.aim.prod.chatisfyReportUrl : config.aim.dev.chatisfyReportUrl;
        const url = new URL(uslString);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'Application/json',
                'Authorization': config.cdp.authorization
            },
            body: JSON.stringify({
                Report: earportData
            })
        });

        const resText = await response.text();
        logger.info(`[TaskResult] response :${resText}`)
        logger.info(`[TaskResult] response ${response.status}:${response.statusText}`)
        if (response.status != 200) {
            throw new AppError({ message: `${response.status}:${response.statusText}`, code: ResultCode.serverError })
        }

        const result = JSON.parse(resText);
        if (result.Status != 'SUCCESS') {
            logger.warn(`[TaskResult] ERROR: ${result.Message}`);
            return { success: false, message: resText };
        } else {
            logger.info(`[TaskResult] SUCCESS: ${result.Data}`);
            return { success: true, message: resText };
        }
    }

    async createTAsToCDP(): Promise<string> {
        let resturnResponds = '';
        try {
            const [tas, count] = await this.cdpTargetAudienceRepository.findAndCount({
                tag: 'new-account',
                isExport: false
            });

            console.log(count);

            for (const ta of tas) {
                //檢查TA是否存在CDP
                const { success, responds } = await this.searchTAs({ lineUserId: ta.psid });
                console.log(responds)
                if (success) {
                    let res = JSON.parse(responds);
                    //好友不存在
                    if (res.returnCode == 2) {
                        //新增TA到CDP
                        logger.info(`create TA "${ta.psid}" start`)
                        const createRes = await this.createTAToCDP(ta);
                        resturnResponds = createRes.responds;
                        logger.info(`create TA end ${resturnResponds}`)
                        if (createRes.success) {
                            await this.updateIsExportAIM(ta.id);
                        }
                    } else if (res.returnCode == 0) {
                        //更新TA回CDP
                        logger.info(`update TA "${ta.psid}" start`)
                        const updateRes = await this.updateTAToCDP({
                            contactid: res.data[0].contactid,
                            gendercode: ta.gender,
                            nickname: ta.firstName
                        })
                        resturnResponds = updateRes.responds;
                        logger.info(`update TA "${ta.psid}" end`)
                        if (updateRes.success) {
                            await this.updateIsExportAIM(ta.id);
                        }
                    } else {
                        logger.warn(`search ta error [returnCode:${res.returnCode}] ${res.returnMsg}`);
                    }
                }
            }
        } catch (err) {
            throw (err);
        }

        return resturnResponds;
    }

    private async createTAToCDP(ta: CDPTargetAudienceEntity): Promise<{ success: boolean, responds?: string }> {
        try {
            const reqBody = JSON.stringify({
                systemcode: config.cdp.cdpAimapiSystemCode,
                lineuid: ta.psid,
                gendercode: ta.gender,
                nickname: ta.firstName,
                //createdonstart: moment().format('yyyy/MM/DD HH:mm:ss'),
                //createdonend: moment().endOf('day').format('yyyy/MM/DD HH:mm:ss'),
                checkcode: CDP.encryptedCheckCode()
            });
            const uslString = (process.env.NODE_ENV === 'production') ? config.aim.prod.createUrl : config.aim.dev.createUrl;
            const url = new URL(uslString);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/json'
                },
                body: reqBody
            });

            const resText = await response.text();
            logger.info(`[createTA] response :${resText}`);

            if (response.status != 200) {
                logger.warn(`[createTA] ${response.status}:${response.statusText}`);
                logger.warn(`[createTA] reqBody: ${reqBody}`);
                return { success: false, responds: resText };
            }

            const result = JSON.parse(resText);
            if (result && result.returnCode != 0) {
                logger.warn(`[createTA] create ta error [${result.contactid}] ${result.returnMsg}`);
                return { success: false, responds: resText };
            }

            return { success: true, responds: resText };
        } catch (err) {
            logger.error(err);
            return { success: false, responds: err.message };
        }
    }

    async updateTAToCDP(params: any) {
        try {
            const reqBody = JSON.stringify({
                systemcode: config.cdp.cdpAimapiSystemCode,
                contactid: params.contactid,
                gendercode: params.gendercode,
                nickname: params.nickname,
                checkcode: CDP.encryptedCheckCode()
            });
            const uslString = (process.env.NODE_ENV === 'production') ? config.aim.prod.updateUrl : config.aim.dev.updateUrl;
            const url = new URL(uslString);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/json'
                },
                body: reqBody
            });

            const resText = await response.text();
            logger.info(`[updateTA] response :${resText}`);

            if (response.status != 200) {
                logger.warn(`[updateTA] ${response.status}:${response.statusText}`);
                logger.warn(`[updateTA] reqBody: ${reqBody}`);
                return { success: false, responds: resText };
            }

            const result = JSON.parse(resText);
            if (result && result.returnCode != 0) {
                logger.warn(`[updateTA] update ta error [${result.contactid}] ${result.returnMsg}`);
                return { success: false, responds: resText };
            }

            return { success: true, responds: resText };
        } catch (err) {
            logger.error(err);
            return { success: false, responds: err.message };
        }
    }

    async searchTAs(params: { lineUserId: string }): Promise<{ success: boolean, responds?: string }> {
        try {
            const reqBody = JSON.stringify({
                systemcode: config.cdp.cdpAimapiSystemCode,
                lineuid: params.lineUserId,
                checkcode: CDP.encryptedCheckCode()
            });
            const uslString = (process.env.NODE_ENV === 'production') ? config.aim.prod.searchUrl : config.aim.dev.searchUrl;
            const url = new URL(uslString);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'Application/json'
                },
                body: reqBody
            });

            const resText = await response.text();

            if (response.status != 200) {
                logger.warn(`search ta error [${response.status}:${response.statusText}] ${resText}`);
                logger.warn(`reqBody: ${reqBody}`);
                return { success: false, responds: resText };
            }

            //const result = JSON.parse(resText);
            // if (result && result.returnCode != 0) {
            //     logger.warn(`search ta error [${result.contactid}] ${result.returnMsg}`);
            //     return { success: false, responds: resText };
            // }

            return { success: true, responds: resText };
        } catch (err) {
            logger.error(err);
            return { success: false, responds: err.message };
        }
    }

    private async updateIsExportAIM(id: number): Promise<boolean> {
        try {
            const ta = await this.cdpTargetAudienceRepository.findOne(id);
            if (ta) {
                ta.isExport = true;
                await this.cdpTargetAudienceRepository.save(ta);
                return true;
            }
        } catch (err) {
            logger.error(err);
        }

        return false;
    }

    async createChatisfyHookData(params: IChatisfyHookData): Promise<void> {
        try {
            let cdpTargetAudience = new CDPTargetAudienceEntity();
            cdpTargetAudience.platform = params.platform;
            cdpTargetAudience.pageId = params.page_id;
            cdpTargetAudience.botId = params.bot_id;
            cdpTargetAudience.lastName = params.last_name;
            cdpTargetAudience.psid = params.psid;
            cdpTargetAudience.firstName = params.first_name;
            cdpTargetAudience.profilePic = params.profile_pic;
            cdpTargetAudience.locale = params.locale;
            cdpTargetAudience.timezone = params.timezone;
            cdpTargetAudience.gender = params.gender;
            cdpTargetAudience.tag = params.tag;

            await this.cdpTargetAudienceRepository.save(cdpTargetAudience);
        } catch (err) {
            logger.error(err);
            throw new AppError({ message: err.message, code: ResultCode.serverError })
        }
    }
}