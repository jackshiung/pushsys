import { AppError } from './../view-models/error.vm';
import { AWS } from "../utils/aws.util";
import { Service } from 'typedi';
import { IMoveFileResult, IUploadToS3Result } from '../interfaces/upload.interface';
import * as mime from 'mime-types';
import { idGenerator, typeChecker } from 'camel-toolbox';
import { ResultCode } from '../view-models/result.vm';
import * as path from "path";
import sharp from 'sharp';

@Service()
export class UploadService {
    private extension(mimetype: string): string {
        let ext = mime.extension(mimetype);
        return ext ? `.${ext}` : '';
    }

    private bucket(): string {
        return process.env.AWS_S3_BUCKET;
    }

    async saveLineImagemapImage(file: Express.Multer.File): Promise<IUploadToS3Result[]> {
        const result: IUploadToS3Result[] = [];
        let filename = `${idGenerator.generateShortId()}-${new Date().getTime()}`;

        const image240 = sharp(file.buffer)
            .resize(240, 240)
            .toBuffer((err) => {
                console.log(err)
            });
        let data240 = await AWS.S3.upload({
            bucket: this.bucket(),
            acl: AWS.S3.EnumACL.PublicRead,
            key: `${process.env.AWS_S3_DIST}/temp/${filename}/240`,
            body: image240
        });
        result.push({
            bucket: data240.Bucket,
            key: data240.Key,
            location: this.changeCDN(data240.Location),
        });

        const image300 = sharp(file.buffer)
            .resize(300, 300)
            .toBuffer((err) => {
                console.log(err)
            });
        let data300 = await AWS.S3.upload({
            bucket: this.bucket(),
            acl: AWS.S3.EnumACL.PublicRead,
            key: `${process.env.AWS_S3_DIST}/temp/${filename}/300`,
            body: image300
        });
        result.push({
            bucket: data300.Bucket,
            key: data300.Key,
            location: this.changeCDN(data300.Location),
        });

        const image460 = sharp(file.buffer)
            .resize(460, 460)
            .toBuffer((err) => {
                console.log(err)
            });
        let data460 = await AWS.S3.upload({
            bucket: this.bucket(),
            acl: AWS.S3.EnumACL.PublicRead,
            key: `${process.env.AWS_S3_DIST}/temp/${filename}/460`,
            body: image460
        });
        result.push({
            bucket: data460.Bucket,
            key: data460.Key,
            location: this.changeCDN(data460.Location),
        });

        const image700 = sharp(file.buffer)
            .resize(700, 700)
            .toBuffer((err) => {
                console.log(err)
            });
        let data700 = await AWS.S3.upload({
            bucket: this.bucket(),
            acl: AWS.S3.EnumACL.PublicRead,
            key: `${process.env.AWS_S3_DIST}/temp/${filename}/700`,
            body: image700
        });
        result.push({
            bucket: data700.Bucket,
            key: data700.Key,
            location: this.changeCDN(data700.Location),
        });

        let data1040 = await AWS.S3.upload({
            bucket: this.bucket(),
            acl: AWS.S3.EnumACL.PublicRead,
            key: `${process.env.AWS_S3_DIST}/temp/${filename}/1040`,
            body: file.buffer
        });
        result.push({
            bucket: data1040.Bucket,
            key: data1040.Key,
            location: this.changeCDN(data1040.Location),
        });

        return result;
    }

    async saveFileToS3(file: Express.Multer.File): Promise<IUploadToS3Result> {
        let mimetype = file.mimetype;
        let ext = this.extension(file.mimetype);
        let filename = `${idGenerator.generateShortId()}-${new Date().getTime()}`;
        let key = `${process.env.AWS_S3_DIST}/temp/${filename}${ext}`;
        let buffer = file.buffer;

        let data = await AWS.S3.upload({
            bucket: this.bucket(),
            acl: AWS.S3.EnumACL.PublicRead,
            key: key,
            contentType: mimetype,
            body: buffer
        });

        let result: IUploadToS3Result = {
            bucket: data.Bucket,
            key: data.Key,
            location: this.changeCDN(data.Location),
        };

        return result;
    }

    private changeCDN(location: string): string {
        if(!process.env.AWS_ENDPOINT_CDN){
            return process.env.AWS_ENDPOINT;
        }
        return location.replace(process.env.AWS_ENDPOINT, process.env.AWS_ENDPOINT_CDN)
    }

    async saveFilesToS3(files: Express.Multer.File[]): Promise<IUploadToS3Result[]> {
        const result: IUploadToS3Result[] = [];

        for (const file of files) {
            const data = await this.saveFileToS3(file);
            result.push(data);
        }

        return result;
    }

    async getImage(key: string): Promise<string> {
        return await AWS.S3.getSignedUrl({
            bucket: this.bucket(),
            key
        })
    }

    async copyAndDeleteImageToNewDist(key: string, location: string, newDist: string): Promise<IMoveFileResult> {
        const decKey = decodeURI(key);
        const splitKey = decKey.split('/temp/');
        const newKey = `${splitKey[0]}/${newDist}/${splitKey[1]}`

        const copyparams: AWS.S3.ICopyObjectParams = {
            bucket: this.bucket(),
            copySource: `${this.bucket()}/${key}`,
            key: newKey,
            acl: AWS.S3.EnumACL.PublicRead
        };
        const copyRes = await AWS.S3.copyObject(copyparams);

        const deleteparams = {
            bucket: this.bucket(),
            key
        };
        await AWS.S3.deleteObject(deleteparams);

        return {
            location: location.replace('temp', newDist),
            key: newKey
        };
    }

    /**
     * 
     * @param oriUrl https://jjdigi.sfo2.digitaloceanspaces.com/vivispa/sample/somepath.jpg
     * @param destPath dest2 with filename
     */
    async copyAndDeleteImage(oriUrl: string, destPath: string): Promise<IMoveFileResult> {

        const basePath = process.env.AWS_S3_DIST;

        const regExp = new RegExp(`\\/${basePath}\\/\\S+`, "g");

        const matchUrls = oriUrl.match(regExp);

        if (typeChecker.isNullOrUndefinedObject(matchUrls)) {
            throw new AppError({ message: `can not find key by this url "${oriUrl}"`, code: ResultCode.clientError })
        }

        const oriKey = matchUrls[0].substr(1);
        const destKey = `${basePath}/${destPath}/${path.basename(oriUrl)}`

        const copyParams: AWS.S3.ICopyObjectParams = {
            bucket: this.bucket(),
            copySource: `${this.bucket()}/${oriKey}`,
            key: destKey,
            acl: AWS.S3.EnumACL.PublicRead
        };

        await AWS.S3.copyObject(copyParams);

        const deleteParams = {
            bucket: this.bucket(),
            key: oriKey
        };

        try {
            await AWS.S3.deleteObject(deleteParams);
        } catch (error) {

        }

        return {
            location: oriUrl.replace(matchUrls[0], "") + '/' + destKey,
            key: destKey
        };

    }
}