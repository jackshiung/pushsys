import { APIResult } from "../models/network.model";
import { axiosInstance } from "./network";

export class FileSvc {

    /**
    * @path [POST] /v1/management/file/image
    */
    async uploadImage(param: UploadFileParameter): Promise<APIResult<UploadFileResult>> {
        const formData = new FormData();
        console.log(`===== uploadImage`,param.image)
        formData.append('image', param.image)
        const response = await axiosInstance.post<APIResult<UploadFileResult>>('/management/file/image', formData, {
            headers: {
                'content-type': 'multipart/form-data'
            }
        });
        return response.data
    }
}


export interface UploadFileParameter {
    image: File
}

export class UploadFileResult {
    bucket: string;

    //** 檔案Key，用來取得signedUrl */
    key: string;

    //** 在digitalocean的URL */
    location: string;

    //** 具時效性公開的URL */
    signedUrl?: string;
}