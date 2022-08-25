import { BaseResult } from './result.vm';
import { Request, Response } from "express";
import { LicenseTokenPayload, UserTokenPayload } from './token.vm';
export interface AppRequest extends Request {
    userTokenPayload: UserTokenPayload,
    licenseTokenPayload: LicenseTokenPayload
}

export interface AppResponse extends Response {
    result: BaseResult;
}

// export interface CDPResponse {
//     cdpResult: {
//         Status: string;
//         Data: string;
//         Message: string;
//     };
//     aimResult: {
//         data: string;
//         returnCode: number;
//         returnMsg: string;
//     }
// }