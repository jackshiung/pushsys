import {
    IsBoolean,
    IsEmail,
    IsInt,
    IsOptional,
    IsString,
    IsUrl,
} from 'class-validator';
import TaskTargetAudienceEntity, {
    EnumTaskTargetAudienceChannel,
} from '../entities/taskTargetAudience.entity';

export interface ICreateTaskTargetAudienceData {
    taskId: number;
    targetAudienceId: number;
    code: string;
    channel: EnumTaskTargetAudienceChannel;
}

export class IBulkCreateTaskTargetAudienceByIdParams {
    taskId: number;
    targetAudienceIds: number[];
}

export class IBulkCreateTaskTargetAudienceParams {
    companyId: number;
    taskId: number;
    tas: ICreateTaskTargetAudienceParams[];
    taIds?: number[];
}

export class ICreateTaskTargetAudienceParams {
    @IsString()
    @IsOptional()
    phone?: string;

    @IsString()
    @IsOptional()
    displayName?: string;

    @IsString()
    @IsOptional()
    lineUserId?: string;

    @IsUrl()
    @IsOptional()
    pictureUrl?: string;

    @IsString()
    @IsOptional()
    messagerPSID?: string;

    @IsEmail()
    @IsOptional()
    email?: string;
}

export interface IBulkCreateTaskTargetAudienceResult {
    count: number;
    rows: TaskTargetAudienceEntity[];
}

export class ISearchTaskTargetAudienceParams {
    @IsOptional()
    @IsInt()
    taskId?: number;

    @IsOptional()
    @IsBoolean()
    isExport?: boolean;

    @IsOptional()
    @IsInt()
    offset?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}
