import { bool } from "aws-sdk/clients/signer";
import { IBaseSearchParams } from "./base.interface";

export enum EnumExportTaskResultDeliveryStatus {
    SENT = '0',
    IN_QUEUE = '1',
    PROCESSING = '2',
    FAILURE = '3'
}

export enum EnumExportTaskResultChannelType {
    LINE = '0',
    LINE_NM = '1',
    Messenger = '2',
    SMS = '3',
}

export interface ICreateCDPTA {
    systemcode: string;
    lineuid: string;
    createdonstart: Date;
    createdonend: Date;
    checkcode: string;
}

export interface IExportTaskResultDto {
    MessageId: string;
    LineUId: string;
    /** 發送狀態  */
    DeliveryStatus: EnumExportTaskResultDeliveryStatus;
    /** 發送渠道 */
    ChannelType: EnumExportTaskResultChannelType;
    /** 發送時間 (YYYY-MM-DD HH:mm:ss) */
    DeliveryTime: string;
    /** 0: 未點擊/1:點擊 */
    IsClick: number;
    /** 點擊時間 (YYYY-MM-DD HH:mm:ss) */
    ClickTime: string;
    /** 0: 未讀/1:已讀 */
    IsRead: number;
    /** 點擊時間 (YYYY-MM-DD HH:mm:ss) */
    ReadTime: string;
    ErrorCode: string;
}

export interface IExportChatisfyTagDto {

}

export interface ISearchCDPTargetAudienceParams extends IBaseSearchParams {
    isExport?: boolean;
    platform?: string;
    botId?: string;
    pageId?: string;
    psid?: string;
}

export interface IChatisfyHookData {
    platform: string; //line",
    page_id: string; //LINE帳號ID"
    bot_id: string; //CHATISFY BOT ID",
    last_name: string; //NULL",
    psid: string; //用戶的LINE ID"
    first_name: string; //用戶LINE顯示名稱",
    profile_pic: string; //用戶頭像URL",
    locale: string; //NULL",
    timezone: string; //NULL",
    gender: string; //NULL",
    tag: string; //chatisfy event
}