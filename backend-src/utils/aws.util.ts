import { AppError } from './../view-models/error.vm';
import * as _AWS from 'aws-sdk';
import { ManagedUpload } from 'aws-sdk/clients/s3';
import { ResultCode } from '../view-models/result.vm';

let s3: _AWS.S3;
export namespace AWS {
    const spacesEndpoint = new _AWS.Endpoint(process.env.AWS_ENDPOINT);
    export function initialize(options: { key: string, secret: string }): void {
        _AWS.config.update({
            accessKeyId: options.key,
            secretAccessKey: options.secret,
        });
        s3 = new _AWS.S3({ endpoint: spacesEndpoint });
    }

    export namespace S3 {
        // API doc
        // https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/S3.html

        export enum EnumACL {
            // 存取權限
            // https://docs.aws.amazon.com/zh_tw/AmazonS3/latest/dev/acl-overview.html
            Private = 'private',
            PublicRead = 'public-read',
            PublicReadWrite = 'public-read-write',
        }

        export enum EnumFolder {
            Activities = 'activities',
            Members = 'members',
            Organizations = 'organizations',
        }

        export interface IListObjectParams {
            bucket: string;
        }

        export interface IGetObjectParams {
            bucket: string;
            key: string; // folder + filename
        }

        export interface IGetSignedUrlParams {
            bucket: string;
            key: string;
            expires?: number;
        }

        export interface IUploadParams {
            bucket: string;
            key: string; // folder + filename
            contentType?: string;
            contentEncoding?: string;
            body: any;
            acl: EnumACL;
        }

        export interface IPutObjectParams extends IUploadParams {
        }

        export interface IDeleteObjectParams {
            bucket: string;
            key: string; // folder + filename
        }

        export interface ICopyObjectParams {
            copySource: string;
            bucket: string;
            key: string; // folder + filename
            acl: EnumACL;
        }

        // const s3 = new _AWS.S3({ apiVersion: '2006-03-01' });
        export function listObjects(params: IListObjectParams): Promise<_AWS.S3.ListObjectsOutput | null> {
            let s3Params: _AWS.S3.ListObjectsRequest = {
                Bucket: params.bucket,
            };
            return new Promise((resolve, reject) => {
                s3.listObjects(s3Params, (err, data) => {
                    if (err) {
                        console.log(err);
                        resolve(null);
                    }
                    resolve(data);
                });
            });
        }

        export function getObject(params: IGetObjectParams): Promise<_AWS.S3.GetObjectOutput | null> {
            let s3Params: _AWS.S3.GetObjectRequest = {
                Bucket: params.bucket,
                Key: params.key,
            };
            return new Promise((resolve, reject) => {
                s3.getObject(s3Params, (err, data) => {
                    if (err) {
                        console.log(err);
                        resolve(null);
                    }
                    resolve(data);
                });
            });
        }

        export function getSignedUrl(params: IGetSignedUrlParams): string {
            return s3.getSignedUrl('getObject', {
                Bucket: params.bucket,
                Key: params.key,
                Expires: params.expires || 3600
            });
        }

        export function putObject(params: IPutObjectParams): Promise<_AWS.S3.PutObjectOutput | null> {
            let s3Params: _AWS.S3.PutObjectRequest = {
                Bucket: params.bucket,
                Key: params.key,
                ContentType: params.contentType,
                ContentEncoding: params.contentEncoding,
                Body: params.body,
                ACL: params.acl,
            };
            return new Promise((resolve, reject) => {
                s3.putObject(s3Params, (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                });
            });
        }

        export function upload(params: IUploadParams): Promise<ManagedUpload.SendData> {
            return new Promise((resolve, reject) => {
                let s3Params: _AWS.S3.PutObjectRequest = {
                    Bucket: params.bucket,
                    Key: params.key,
                    ContentType: params.contentType,
                    ContentEncoding: params.contentEncoding,
                    Body: params.body,
                    ACL: params.acl,
                };
                s3.upload(s3Params, (err, data) => {
                    if (err) reject(err);
                    resolve(data);
                });
            });
        }

        export function deleteObject(params: IDeleteObjectParams): Promise<void> {
            return new Promise((resolve, reject) => {
                let s3Params: _AWS.S3.DeleteObjectRequest = {
                    Bucket: params.bucket,
                    Key: params.key
                };
                s3.deleteObject(s3Params, (err, data) => {
                    if (err) reject(err);
                    resolve();
                });
            });
        }

        export function copyObject(params: ICopyObjectParams): Promise<_AWS.S3.CopyObjectOutput | null> {
            return new Promise((resolve, reject) => {
                let s3Params: _AWS.S3.CopyObjectRequest = {
                    CopySource: params.copySource,
                    Bucket: params.bucket,
                    Key: params.key,
                    ACL: params.acl
                };
                s3.copyObject(s3Params, (err, data) => {
                    if (err) {
                        console.log(`copyObject error`, err);
                        reject(new AppError({ message: err.message ?? 'copy image error', code: ResultCode.serverError }));
                        return;
                    }
                    resolve(data);
                });
            });
        }
    }
}