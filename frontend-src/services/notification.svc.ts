import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { APIListResult, APIResult } from '../models/network.model'
import { axiosInstance } from "./network";
export class NotificationSvc {

    /**
     * 取得推播任務列表
     * @path /api/v1/management/notification/task?p=1&ps=10
     */
    async getTasks(param: GewTasksParameter): Promise<APIListResult<ISearchTaskResult>> {
        const response = await axiosInstance.get<APIListResult<ISearchTaskResult>>('/management/notification/task', {
            params: {
                p: param.index,
                ps: param.size
            }
        })
        return response.data;
    }

    /**
     * 取得任務資訊
     * @path [GET] /api/v1/management/notification/task/:id
     */
    async getTask(id: string): Promise<APIResult<ISearchTaskResult>> {
        const response = await axiosInstance.get<APIResult<ISearchTaskResult>>(`/management/notification/task/${id}`)
        return response.data;
    }

    /**
     * 取消任務
     * @path [DELETE] /api/v1/management/notification/task/:id
     */
    async cancelTask(id: string): Promise<APIResult<ISearchTaskResult>> {
        const response = await axiosInstance.delete<APIResult<ISearchTaskResult>>(`/management/notification/task/${id}`)
        return response.data;
    }

    /**
     * 新增任務
     * @path [POST] /api/v1/management/notification/task
     */
    async createTask(param: CreateTaskParameter): Promise<APIResult<ISearchTaskResult>> {
        const response = await axiosInstance.post<APIResult<ISearchTaskResult>>(`/management/notification/task/create`, param)
        return response.data;
    }

    /**
     * 確認任務
     * @path [PUT] /api/v1/management/notification/task/:id
     */
    async confirmTask(id: string): Promise<APIResult<ISearchTaskResult>> {
        const response = await axiosInstance.put<APIResult<ISearchTaskResult>>(`/management/notification/task/confirm/${id}`)
        return response.data;
    }
}

export class CreateTaskParameter {

    @IsString({ message: '請輸入推送任務名稱' })
    @IsNotEmpty({ message: '請輸入推送任務名稱' })
    name: string;

    @IsDateString({}, { message: '請選擇時間' })
    @IsNotEmpty({ message: '請選擇時間' })
    startTime: string;

    @IsInt({ message: '請選擇樣板' })
    lineTemplateId: number;

    @IsInt({ message: '請選擇受眾' })
    taGroupId?: number;
}

export interface GewTasksParameter {
    index: number
    size: number
}


export interface ISearchTaskResult {
    id: number;
    name: string;
    startTime: string;
    actionType: EnumActionType;
    channel: EnumTaskChannel;
    status: EnumTaskStatus;
    createDate: string
    ta: {
        count: number;
        readCount: number;
        clickedCount: number;
    }
    templateId: number
}


export enum EnumActionType {
    Marketing = "marketing",
    Notification = "notification"
}

export enum EnumTaskChannel {
    SMS = "SMS",
    LINE = "line",
    Messenger = "messenger",
    Line_Notification = "lineNotification",
    Messenger_Notification = "messengerNotification",
    Interaction = "interaction",
    CostSaving = "costSaving"
}

export enum EnumTaskStatus {
    Processing = "processing",
    Completed = "completed",
    Pending = 'pending',
    Canceled = 'canceled'
}