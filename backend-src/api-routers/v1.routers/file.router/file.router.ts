import { ResultCode } from '../../../view-models/result.vm';
import { AppRequest, AppResponse } from '../../../view-models/http.vm';
import { Router } from 'express';
import multer from "multer";
import { getAPIListResult, getAPIResult } from '../../../view-models/result.vm';
import { UploadService } from '../../../services/upload.service';
import Container from 'typedi';
import { AppError } from '../../../view-models/error.vm';

const upload = multer({ storage: multer.memoryStorage() })

const router = Router();

/**
 * @path [POST] /v1/management/file/image
 */
router.post('/image', upload.single('image'), async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!req.file || Object.keys(req.file).length === 0) {
            return new AppError({ message: 'No file was uploaded', code: ResultCode.clientError });
        }

        const uploadService = Container.get(UploadService);
        const item = await uploadService.saveFileToS3(req.file)
        res.result = getAPIResult(item)
        next();
    } catch (error) {
        next(error)
    }
})

/**
 * @path [POST] /v1/management/file/imagemap
 */
 router.post('/imagemap', upload.single('image'), async (req: AppRequest, res: AppResponse, next) => {
    try {
        if (!req.file || Object.keys(req.file).length === 0) {
            return new AppError({ message: 'No file was uploaded', code: ResultCode.clientError });
        }

        const uploadService = Container.get(UploadService);
        const item = await uploadService.saveLineImagemapImage(req.file)
        res.result = getAPIResult(item)
        next();
    } catch (error) {
        next(error)
    }
})

export default router;