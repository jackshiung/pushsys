import { IsOptional } from 'class-validator';
import { IsUrl } from 'class-validator';
import { IsNotEmpty, IsString } from 'class-validator';
export class IUploadToS3Result {
    bucket: string;

    //** 檔案Key，用來取得signedUrl */
    key: string;

    //** 在digitalocean的URL */
    location: string;

    //** 具時效性公開的URL */
    signedUrl?: string;
}

export interface IMoveFileResult {
    location: string;
    key: string;
}