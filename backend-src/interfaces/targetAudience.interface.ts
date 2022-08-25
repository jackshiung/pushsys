import { IBaseSearchParams } from './base.interface';
import { ILineProfileResult } from './line.interface';
import { ICreateTaskTargetAudienceParams } from './taskTargetAudience.interface';

export class IUpsertTargetAudienceParams extends ICreateTaskTargetAudienceParams {
    companyId: number;
}

export interface ICreateTargetAudienceResult {}

export interface IBulkUpsertTargetAudienceParams {
    companyId: number;
    tas: ICreateTaskTargetAudienceParams[];
}

export interface IUpsertTargetAudienceResult {
    ids: number[];
}

export interface ISearchTargetAudienceParams extends IBaseSearchParams {
    displayName?: string;
    createDate1?: Date;
    createDate2?: Date;
    isImport?: boolean;
    isFollowed?: boolean;
}

export interface ISearchTargetAudienceResult {
    id: number;
    displayName: string;
    pictureUrl: string;
    email: string;
    createDate: Date;
    isFollowed: boolean;
    lineUserId: string;
}

export class IDeleteTargetAudienceParams {
    companyId: number;
    targetAudienceId: number;
}

export interface IUpdateTargetAudienceByLineIdParams extends ILineProfileResult {
    lineId: string;
}