import { Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsEnum, IsInt, IsJSON, IsNotEmpty, IsObject, IsOptional, IsString, IsUrl, ValidateNested } from "class-validator";
import TaskEntity, { EnumActionType, EnumTaskChannel, EnumTaskStatus } from "../entities/task.entity";
import { IBaseSearchParams } from "./base.interface";
import { ICreateTaskTargetAudienceParams } from "./taskTargetAudience.interface";

export class ITaskTagParams {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsInt()
    @IsNotEmpty()
    expirationDay: number;
}

export class ITaskMessageButtonParams {
    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUrl()
    @IsOptional()
    url?: string;
}

export class ITaskMessageParams {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    content: string;

    @IsUrl()
    @IsOptional()
    imageUrl?: string;

    // @Type(() => ITaskMessageButtonParams)
    // @IsOptional()
    // button?: ITaskMessageButtonParams;
}

export class ICreateTaskParams {
    @IsInt()
    @IsNotEmpty()
    companyId: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsDateString()
    @IsNotEmpty()
    startTime: string;

    //@IsString()
    //@IsNotEmpty()
    //actionType: EnumActionType;

    //@IsString()
    //@IsNotEmpty()
    //channel: EnumTaskChannel;

    @IsInt()
    @IsOptional()
    lineTemplateId?: number;

    @IsOptional()
    @Type(() => ITaskMessageParams)
    message?: ITaskMessageParams;

    // @IsBoolean()
    // @IsOptional()
    // isBindingMode?: boolean;

    // @IsBoolean()
    // @IsOptional()
    // isReissueSMS?: boolean;

    // @IsArray()
    // @IsOptional()
    // @ValidateNested({ each: true })
    // @Type(() => ITaskTagParams)
    // tags?: ITaskTagParams[];

    // @IsEnum(EnumMessengerTag)
    // @IsOptional()
    // messengerTag?: EnumMessengerTag;

    // @IsString()
    // @IsOptional()
    // lineTag?: EnumLinePNPType;

    // @IsJSON()
    // @IsOptional()
    // lineNotificationParams?: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ICreateTaskTargetAudienceParams)
    @IsOptional()
    tas?: ICreateTaskTargetAudienceParams[];

    @IsInt()
    @IsOptional()
    taGroupId?: number;
}

export class IUpdateTaskParams extends ICreateTaskParams {
    @IsInt()
    @IsNotEmpty()
    taskId: number;
    status: EnumTaskStatus;
}

export class IResendTaskParams {
    @IsInt()
    @IsNotEmpty()
    taskId: number;

    @IsString()
    @IsOptional()
    channel?: EnumTaskChannel;

    @IsBoolean()
    @IsOptional()
    isReissueSMS?: boolean;

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ITaskTagParams)
    tags?: ITaskTagParams[];

    @IsOptional()
    messengerTag?: string;

    @IsString()
    @IsOptional()
    lineTag?: string;

    @IsJSON()
    @IsOptional()
    lineNotificationParams?: string;
}

export interface ICreateTaskResult extends TaskEntity { }

export interface IUpdateTaskResult extends TaskEntity { }

export interface IResendTaskResult extends ICreateTaskResult { }

export class ITaskRun {
    taskId: number;
}

export class ISearchTaskParams extends IBaseSearchParams {

}

export class ICreateTAParams {
    companyId: number;
    taskId: number;
    tas: ICreateTaskTargetAudienceParams[];
}

export interface ISearchTaskResult {
    id: number;
    name: string;
    startTime: string;
    actionType: EnumActionType;
    channel: EnumTaskChannel;
    status: EnumTaskStatus;
    ta: {
        count: number;
        readCount: number;
        clickedCount: number;
    }
    createDate: Date;
    templateId: number;
}