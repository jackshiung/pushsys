import { Router } from 'express';
import moment from 'moment';
import Container from 'typedi';
import { ICreateTAParams, ICreateTaskParams, ITaskRun } from '../../../interfaces/task.interface';
import { TaskService } from '../../../services/task.service';
import { Format } from '../../../utils/format.util';
import { AppError } from '../../../view-models/error.vm';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import { getAPIListResult, getAPIResult, ResultCode } from '../../../view-models/result.vm';
const router = Router();

/**
 * @name 新增任務
 * @path [POST] /api/v1/notification/task/create
 * @path [POST] /api/v1/management/notification/task/create
 **/
router.post('/create', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(TaskService);
        const item = await svc.create({ companyId: req.licenseTokenPayload.companyId, ...req.body });
        res.result = getAPIResult({
            id: item.id,
            name: item.name,
            startTime: moment(item.startTime).format('YYYY-MM-DD'),
            actionType: item.actionType,
            channel: item.channel
        });
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 任務清單
 * @path [GET] /api/v1/notification/task?p=1&ps=10
 * @path [GET] /api/v1/management/notification/task?p=1&ps=10
 **/
router.get('/', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const p = Format.tryGetInteger(req.query.p, 1);
        const ps = Format.tryGetInteger(req.query.ps, 10);
        const offset = (p - 1) * ps;
        const svc = Container.get(TaskService);
        const data = await svc.findAll({
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
 * @name 任務詳細內容
 * @path [GET] /api/v1/notification/task/:id
 * @path [GET] /api/v1/management/notification/task/:id
 **/
router.get('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(TaskService);
        const item = await svc.findOne(+req.params.id);
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 更新任務
 * @path [PUT] /api/v1/notification/task/:id
 * @path [PUT] /api/v1/management/notification/task/:id
 **/
router.put('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(TaskService);
        const item = await svc.update({ taskId: +req.params.id, ...req.body });
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 確認任務(並加入執行排程)
 * @path [PUT] /api/v1/notification/task/confirm/:id
 * @path [PUT] /api/v1/management/notification/task/confirm/:id
 **/
router.put('/confirm/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(TaskService);
        const item = await svc.confirm(+req.params.id);
        res.result = getAPIResult({
            id: item.id,
            actionType: item.actionType,
            channel: item.channel,
            name: item.name,
            startTime: item.startTime,
            publishTitle: item.publishTitle,
            publishMessage: item.publishMessage,
            status: item.status,
            isDeleted: item.isDeleted
        });
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 補發任務(針對失敗TA補發)
 * @path [PUT] /api/v1/notification/resend/:id
 * @path [PUT] /api/v1/management/notification/resend/:id
 **/
router.put('/resend/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(TaskService);
        const item = await svc.resend({ taskId: +req.params.id, ...req.body });
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 取消任務
 * @path [DELETE] /api/v1/notification/task/:id
 * @path [DELETE] /api/v1/management/notification/task/:id
 **/
router.delete('/:id', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(TaskService);
        const item = await svc.delete(+req.params.id);
        res.result = getAPIResult({
            id: item.id,
            name: item.name,
            actionType: item.actionType,
            channel: item.channel,
            isDeleted: item.isDeleted
        });
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 新增任務受眾
 * @path [POST] /api/v1/notification/task/ta
 * @path [POST] /api/v1/management/notification/task/ta
 **/
router.post('/ta', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(TaskService);
        const item = await svc.createTAs({ companyId: req.licenseTokenPayload.companyId, ...req.body } as ICreateTAParams);
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

/**
 * @name 重置任務受眾
 * @path [PUT] /api/v1/notification/task/ta/:id
 * @path [PUT] /api/v1/management/notification/task/ta/:id
 **/
router.put('/ta', async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!+req.params.id) {
            throw new AppError({ message: 'request params error', code: ResultCode.clientError })
        }
        const svc = Container.get(TaskService);
        const item = await svc.resetTAs(+req.params.id);
        res.result = getAPIResult(item);
        next();
    } catch (err) {
        next(err);
    }
})

export default router;