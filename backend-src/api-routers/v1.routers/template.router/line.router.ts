import { isInt } from 'class-validator';
import { Router } from 'express';
import Container from 'typedi';
import { ICreateLineTemplateParams, IUpdateLineTemplateParams } from '../../../interfaces/lineTemplate.interface';
import { LineTemplateService } from '../../../services/lineTemplate.service';
import { Format } from '../../../utils/format.util';
import { AppError } from '../../../view-models/error.vm';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import { getAPIListResult, getAPIResult, ResultCode } from '../../../view-models/result.vm';
const router = Router();

/**
 * @name 樣板清單
 * @path [GET] /api/v1/template/line?p=1&ps=10
 * @path [GET] /api/v1/management/template/line?p=1&ps=10
 **/
router.get('/', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const p = Format.tryGetInteger(req.query.p, 1);
        const ps = Format.tryGetInteger(req.query.ps, 10);
        const offset = (p - 1) * ps;
        const svc = Container.get(LineTemplateService);
        const data = await svc.findAll({
            ...req.query,
            limit: ps,
            offset
        });
        res.result = getAPIListResult(data.rows, {
            dataAmount: data.count,
            pageAmount: Math.ceil(data.count / ps),
            pageIndex: p,
            pageSize: ps
        });
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 樣板詳細內容
 * @path [GET] /api/v1/management/template/line/:id
 **/
router.get('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(LineTemplateService);
        const data = await svc.findOne(+req.params.id);
        res.result = getAPIResult(data);
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 刪除樣板
 * @path [DELETE] /api/v1/management/template/line/:id
 **/
router.delete('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(LineTemplateService);
        const item = await svc.delete(+req.params.id);
        res.result = getAPIResult({
            id: item.id,
            name: item.name,
            isDeleted: item.isDeleted
        });
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 新增樣板
 * @path [POST] /api/v1/management/template/line/create
 **/
router.post('/create', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineTemplateService);
        const item = await svc.create({
            companyId: req.licenseTokenPayload.companyId,
            ...req.body
        } as ICreateLineTemplateParams);
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 新增樣板
 * @path [POST] /api/v1/management/template/line/update/:id
 **/
router.put('/update/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(LineTemplateService);
        const item = await svc.update({
            companyId: req.licenseTokenPayload.companyId,
            templateId: req.params.id,
            ...req.body
        } as IUpdateLineTemplateParams);
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

export default router;