import { Router } from 'express';
import Container from 'typedi';
import { IPublishFlexImageParams, IPublishFlexPersonParams, IPublishFlexPlaceParams, IPublishFlexProductParams, IPublishFlexTextParams, IPublishImageCarouselLineParams, IPublishImagemapLineParams, IPublishLineParams, IVideoTemplateParams as IPublishVideoTemplateParams } from '../../../interfaces/line.interface';
import { LineLibSvc } from '../../../libs/line.lib.svc';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import { getAPIListResult, getAPIResult } from '../../../view-models/result.vm';
const router = Router();

router.post('/publish/flex/text', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishFlexText(req.body as IPublishFlexTextParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

router.post('/publish/flex/image', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishFlexImage(req.body as IPublishFlexImageParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

router.post('/publish/imagemap', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishImagemap(req.body as IPublishImagemapLineParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

router.post('/publish/image_carousel', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishImageCarousel(req.body as IPublishImageCarouselLineParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

router.post('/publish/flex/product', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishFlexProduct(req.body as IPublishFlexProductParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

router.post('/publish/flex/place', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishFlexPlace(req.body as IPublishFlexPlaceParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

router.post('/publish/flex/person', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishFlexPerson(req.body as IPublishFlexPersonParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

router.post('/publish/video', async (req: AppRequest, res: AppResponse, next) => {
    try {
        const svc = Container.get(LineLibSvc)
        const item = await svc.publishVideo(req.body as IPublishVideoTemplateParams);
        res.result = getAPIResult(item);
        next();
    } catch (error) {
        next(error)
    }
})

export default router;