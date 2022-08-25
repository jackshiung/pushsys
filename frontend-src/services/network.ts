import { APIResult, ResultCode } from '../models/network.model';
import axios from "axios";


export const axiosInstance = axios.create({
    baseURL: '/proxy/api/v1/'
});

axiosInstance.interceptors.response.use((response) => {
    const ret = response.data as APIResult<unknown>;
    if (ret.code === ResultCode.userVerificationError) {
        location.href = "/login"
        return;
    }
    return response;
}, (error) => {
    return Promise.reject(error)
})