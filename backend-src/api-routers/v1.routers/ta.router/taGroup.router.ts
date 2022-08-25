import { Router } from 'express';
import Container from 'typedi';
import {
    IAddTAParams,
    IDownloadTargetAudienceGroupParams,
    IUploadTargetAudienceGroupParams,
    ICreateTargetAudienceGroupParams,
} from '../../../interfaces/targetAudienceGroup.interface';
import { TargetAudienceGroupService } from '../../../services/targetAudienceGroup.service';
import { Format } from '../../../utils/format.util';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import {
    getAPIListResult,
    getAPIResult,
    ResultCode,
} from '../../../view-models/result.vm';
import multer from 'multer';
import { AppError } from '../../../view-models/error.vm';
import * as mime from 'mime-types';
import { EnumSourceType } from '../../../entities/targetAudienceGroup.entity';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

/**
 * @name 受眾包清單
 * @path [GET] /api/v1/management/ta/group?p=1&ps=10
 * @Path [GET] /api/v1/ta/group?p=1
 *
 **/
router.get('/', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const p = Format.tryGetInteger(req.query.p, 1);
        const ps = Format.tryGetInteger(req.query.ps, 10);
        const offset = (p - 1) * ps;
        const svc = Container.get(TargetAudienceGroupService);
        const data = await svc.findAll({
            ...req.query,
            limit: ps,
            offset,
        });
        res.result = getAPIListResult(data.rows, {
            dataAmount: data.count,
            pageAmount: Math.ceil(data.count / ps),
            pageIndex: p,
            pageSize: ps,
        });
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * @name 受眾包詳細資料
 * @path [GET] /api/v1/management/ta/group/:id
 * @Path [GET] /api/v1/ta/group/:id
 **/
router.get('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({
                message: 'request params error',
                code: ResultCode.clientError,
            });
        }
        const svc = Container.get(TargetAudienceGroupService);
        const item = await svc.findOneAndTAs(+req.params.id);
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * @name 下載受眾包
 * @path [GET] /api/v1/management/ta/group/download/:id
 **/
router.get('/download/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({
                message: 'request params error',
                code: ResultCode.clientError,
            });
        }
        const svc = Container.get(TargetAudienceGroupService);
        const { content, fileName } = await svc.download({
            targetAudienceGroupId: +req.params.id,
        } as IDownloadTargetAudienceGroupParams);

        const mimetype = mime.lookup(fileName);
        res.set('Content-Type', <string>mimetype);
        res.set(
            'Content-Disposition',
            'attachment; filename=' + encodeURIComponent(fileName)
        );
        res.set('Content-Length', content.length);

        res.end(Buffer.from(content, 'binary'));
        res.result = getAPIResult({});
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * @name 新增受眾包
 * @path [POST] /api/v1/management/ta/group
 * @Path [POST] /api/v1/ta/group
 **/
router.post('/', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(TargetAudienceGroupService);
        const group = await svc.create({
            companyId: req.licenseTokenPayload.companyId,
            sourceType: req.userTokenPayload
                ? EnumSourceType.WEB
                : EnumSourceType.API,
            ...req.body,
        } as ICreateTargetAudienceGroupParams);
        res.result = getAPIResult({
            id: group.id,
            name: group.name,
            tas:
                group.items.count == 0
                    ? []
                    : group.items.rows.map((data) => ({
                          targetAudienceGroupId: data.targetAudienceGroupId,
                          targetAudienceId: data.targetAudienceId,
                      })),
        });
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * @name 上傳新增受眾包
 * @path [POST] /api/v1/management/ta/group/upload
 **/
router.post(
    '/upload',
    upload.single('file'),
    async (req: AppRequest, res: AppResponse, next) => {
        try {
            if (!req.file || Object.keys(req.file).length === 0) {
                return new AppError({
                    message: 'No file was uploaded',
                    code: ResultCode.clientError,
                });
            }

            const svc = Container.get(TargetAudienceGroupService);
            const group = await svc.upload(
                {
                    companyId: req.licenseTokenPayload.companyId,
                    ...req.body,
                } as IUploadTargetAudienceGroupParams,
                req.file
            );
            res.result = getAPIResult({
                id: group.id,
                name: group.name,
                tas: {
                    count: group.items.count,
                    rows:
                        group.items.count == 0
                            ? []
                            : group.items.rows.map((data) => ({
                                  targetAudienceGroupId:
                                      data.targetAudienceGroupId,
                                  targetAudienceId: data.targetAudienceId,
                              })),
                },
            });
            next();
        } catch (err) {
            next(err);
        }
    }
);

/**
 * @name 受眾包新增受眾
 * @path [PUT] /api/v1/management/ta/group/:id
 **/
router.put('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({
                message: 'request params error',
                code: ResultCode.clientError,
            });
        }
        const svc = Container.get(TargetAudienceGroupService);
        const group = await svc.addTAs({
            companyId: req.licenseTokenPayload.companyId,
            targetAudienceGroupId: +req.params.id,
            ...req.body,
        } as IAddTAParams);
        res.result = getAPIResult({
            id: group.id,
            name: group.name,
            tas: {
                count: group.items.count,
                rows:
                    group.items.count == 0
                        ? []
                        : group.items.rows.map((data) => ({
                              targetAudienceGroupId: data.targetAudienceGroupId,
                              targetAudienceId: data.targetAudienceId,
                          })),
            },
        });
        next();
    } catch (err) {
        next(err);
    }
});

/**
 * @name 刪除受眾包
 * @path [DELETE] /api/v1/management/ta/group/:id
 **/
router.delete('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({
                message: 'request params error',
                code: ResultCode.clientError,
            });
        }
        const svc = Container.get(TargetAudienceGroupService);
        const group = await svc.delete({
            companyId: req.licenseTokenPayload.companyId,
            targetAudienceGroupId: +req.params.id,
            ...req.body,
        } as IAddTAParams);
        res.result = getAPIResult({
            id: group.id,
            name: group.name,
            isDeleted: group.isDeleted,
        });
        next();
    } catch (err) {
        next(err);
    }
});

export default router;
