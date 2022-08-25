import { IBaseSearchParams } from "./base.interface";

export class ICreateTagParams {
    companyId: number;
    taskId: number;
    name: string;
}

export interface ISearchTagParams extends IBaseSearchParams {
    taskId: number;
    name: string;
}