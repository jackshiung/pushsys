import { APIResult } from './../models/network.model';
import { axiosInstance } from "./network";

export class UserSvc {

    /**
     * [POST] /api/v1/user/verification/login
     */
    async login(param: ILoginParams): Promise<APIResult<{ token: string }>> {
        const res = await axiosInstance.post<APIResult<{ token: string }>>('/user/verification/login', param);
        return res?.data
    }
}


export interface ILoginParams {
    account: string;
    password: string;
}