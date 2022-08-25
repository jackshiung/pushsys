import { APIListResult, APIResult } from './../models/network.model';
import { axiosInstance } from "./network";
export class TargetSvc {

    /**
     * @path /api/v1/management/ta/group?p=1&ps=10
     */
    async getTargetGroupList(param: GetTargetGroupParameter): Promise<APIListResult<ISearchTargetAudienceGroupResult>> {
        const response = await axiosInstance.get<APIListResult<ISearchTargetAudienceGroupResult>>('/management/ta/group', {
            params: {
                p: param.index,
                ps: param.size,
                name: param.name ?? ""
            }
        });

        return response.data
    }

    async getTargetGroup(id: string): Promise<APIResult<ISearchTargetAudienceGroupResult>> {
        const response = await axiosInstance.get(`/management/ta/group/${id}`)
        return response.data
    }

    /**
     * @path /api/v1/management/ta/group/upload
     */
    async upload(param: UploadTargetAudienceParameter): Promise<APIResult<ISearchTargetAudienceGroupResult>> {

        const formData = new FormData();
        formData.append('file', param.file)
        formData.append('name', param.name)

        const response = await axiosInstance.post<APIResult<ISearchTargetAudienceGroupResult>>('/management/ta/group/upload', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });

        return response.data
    }

    async delete(id: string): Promise<APIResult<ISearchTargetAudienceGroupResult>> {
        const response = await axiosInstance.delete<APIListResult<ISearchTargetAudienceGroupResult>>(`/management/ta/group/${id}`);
        return response.data
    }

    async getTargets(param: GetTargetsWithPaginationParameter): Promise<APIListResult<LineUser>> {
        const response = await axiosInstance.get<APIListResult<LineUser>>('/management/ta', {
            params: {
                p: param.index,
                ps: param.size,
                name: param.name ?? "",
                date1: param.date1 ?? null,
                date2: param.date2 ?? null,
                is_import: param.isImport,
                is_followed: param.isFollowed
            }
        });

        return response.data
    }

    async createTargetGroup(param: CreateTargetParameter): Promise<APIResult<Target>> {
        const response = await axiosInstance.post('/management/ta/group', param)
        return response.data;
    }
}

export interface GetTargetsWithPaginationParameter extends GetTargetsParameter {
    index: number
    size: number
}

export interface GetTargetsParameter {
    name?: string
    date1?: Date
    date2?: Date
    isImport?: boolean
    isFollowed?: boolean
}


export interface GetTargetGroupParameter {
    index: number
    size: number
    name?: string
}

export interface ISearchTargetAudienceGroupResult {
    id: number;
    name: string;
    createDate: string;
    taCount: number
    sourceType: EnumSourceType
}

export interface UploadTargetAudienceParameter {
    file: File
    name: string
}

export enum EnumSourceType {
    API = "api", //CDP
    WEB = 'web' //Web後台
}

export interface LineUser {
    id: number
    displayName?: string
    pictureUrl?: string
    email?: string
    createDate: Date
    isFollowed: boolean
    lineUserId: string
}

export interface CreateTargetParameter {
    name: string
    filters: GetTargetsParameter
}

export interface Target {
    id: number
    name: string
    tas: {
        targetAudienceGroupId: number,
        targetAudienceId: number
    }[]
}