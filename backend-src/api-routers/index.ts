import { Router } from 'express';
import * as bodyParser from "body-parser";
import v1Routers from "./v1.routers";

const router = Router();
router.use(bodyParser.json());
router.use('/v1', v1Routers);
export default router;