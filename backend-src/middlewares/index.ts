import { errorHandler } from "./error.handler.middleware";
import { resultHandler } from "./result.handler.middleware";
import * as bodyParser from "body-parser";

export const endMiddlewares = [
    resultHandler,
    errorHandler
];

export const startMiddlewares = [
    bodyParser.json()
]