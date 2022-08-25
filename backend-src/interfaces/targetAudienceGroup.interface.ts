import { bool } from 'aws-sdk/clients/signer';
import { Type } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    ValidateNested,
} from 'class-validator';
import TargetAudienceGroupEntity from '../entities/targetAudienceGroup.entity';
import TargetAudienceGroupItemEntity from '../entities/targetAudienceGroupItem.entity';
import { IBaseSearchParams } from './base.interface';
import { ICreateTaskTargetAudienceParams } from './taskTargetAudience.interface';

export class ISearchTargetAudienceGroupParams extends IBaseSearchParams {
    @IsOptional()
    @IsString()
    name?: string;

    @IsOptional()
    @IsInt()
    offset?: number;

    @IsOptional()
    @IsInt()
    limit?: number;
}

export class ICreateTargetAudienceGroupDataFilter {
    @IsString()
    @IsOptional()
    name?: string;

    @IsDate()
    @IsOptional()
    date1?: Date;
    
    @IsDate()
    @IsOptional()
    date2?: Date;

    @IsBoolean()
    @IsOptional()
    isImport?: boolean;

    @IsBoolean()
    @IsOptional()
    isFollowed?: boolean;
}

export class ICreateTargetAudienceGroupParams {
    companyId: number;
    @IsString()
    @IsNotEmpty()
    name: string;

    @Type(() => ICreateTargetAudienceGroupDataFilter)
    @IsOptional()
    filters?: ICreateTargetAudienceGroupDataFilter;
}

export class IUpdateTargetAudienceGroupParams {
    targetAudienceGroupId: number;
    name?: string;
    taCount?: number;
}

export interface IUpdateTargetAudienceGroupResult {
    targetAudienceGroupId: number;
    name: string;
}

export class IImportTargetAudienceGroupParams {
    companyId: number;

    @IsString()
    @IsNotEmpty()
    name: string;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => ICreateTaskTargetAudienceParams)
    tas: ICreateTaskTargetAudienceParams[];
}

export class IUploadTargetAudienceGroupParams {
    companyId: number;

    @IsString()
    @IsNotEmpty()
    name: string;
}

export class IDownloadTargetAudienceGroupParams {
    targetAudienceGroupId: number;
}

export interface IDownloadTargetAudienceGroupResult {
    content: any;
    fileName: string;
}

export interface ICreateTargetAudienceGroupResult
    extends TargetAudienceGroupEntity {
    items: ICreateTargetAudienceGroupItemResult;
}

export interface ICreateTargetAudienceGroupItemResult {
    count: number;
    rows: TargetAudienceGroupItemEntity[];
}

export interface IBulkCreateTargetAudienceGroupByIdParams {
    groupId: number;
    targetAudienceIds: number[];
}

export interface ICreateTargetAudienceGroupData {
    targetAudienceGroupId: number;
    targetAudienceId: number;
}

export interface IAddTAParams {
    companyId: number;
    targetAudienceGroupId: number;
    tas: ICreateTaskTargetAudienceParams[];
}

export interface ISearchTargetAudienceGroupResult {
    id: number;
    name: string;
    createDate: string;
}

export class IDeleteTargetAudienceGroupParams {
    companyId: number;
    targetAudienceGroupId: number;
}
