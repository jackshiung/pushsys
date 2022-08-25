import { config } from './../configuration/index'
import { APIResult, ResultCode } from './../view-models/result.vm'
import e, { NextFunction, Router } from 'express'
import proxy from 'express-http-proxy'
import { AppRequest, AppResponse } from '../view-models/http.vm'
import * as cookie from 'cookie'
import { typeChecker } from 'camel-toolbox'
import * as jwt from 'jsonwebtoken'
import * as luxon from 'luxon'
import { AppError, getErrorResult } from '../view-models/error.vm'
import Container from 'typedi'
import { UserVerificationSvc } from '../services/userVerification.service'
const router = Router()

export function proxyHandler(req: AppRequest, res: AppResponse, next: NextFunction) {
    proxy(`localhost:${config.appPort}`, {
        limit: '50mb',
        // 後台 request 時要透過 proxy 帶入 token
        /**
         * 1. 後台 request 時要透過 proxy 帶入 token
         * 2. 前台 request 要帶入 member login token
         * @param proxyReqOpts 
         * @param srcReq 
         */
        proxyReqOptDecorator: async function (proxyReqOpts, srcReq) {


            if (proxyReqOpts.path.includes('/api/v1') && req.cookies) {
                let userToken = req.cookies['user-token']
                if (userToken) {
                    userToken = await checkUserTokenIsNeedRefresh(userToken, res)
                    proxyReqOpts.headers['x-user-token'] = userToken
                }
            }

            return proxyReqOpts
        },

        // 後台 login or refresh token 時要透過 proxy 寫入 token
        userResDecorator: function (proxyRes: e.Response, proxyResData, userReq, userRes) {
            try {


                try {
                    if (userReq.path.includes('/api/v1/management/ta/group/download')) {
                        return proxyResData
                    }
                } catch (error) {
                    console.log(`userResDecorator error [parsed download]`, error)
                }


                const [isManagementVerification, managementToken, managementTtl] = checkIsManagementVerification(userReq.path, proxyRes, proxyResData)
                if (isManagementVerification && managementToken) {
                    res.cookie('user-token', managementToken, {
                        expires: luxon.DateTime.local().plus({ seconds: managementTtl }).toJSDate(),
                        httpOnly: true,
                    })

                    return proxyResData
                }


                return proxyResData
            } catch (error) {
                console.log(`userResDecorator error`, error)
                return JSON.stringify(getErrorResult(error))
            }
        },
    })(req, res, next)
    return
}

function checkIsManagementVerification(requestPath: string, res: e.Response, resData: any): [boolean, string, number] {
    const setUserCookiePaths: string[] = ['/api/v1/user/verification/login', '/api/v1/user/verification/refresh-token']

    const result: APIResult<{ token: string }> = JSON.parse(resData.toString('utf8'))

    const isVerification: boolean =
        setUserCookiePaths.some((path) => requestPath.includes(path)) &&
        res.statusCode === 200 &&
        result.success &&
        !typeChecker.isNullOrUndefinedOrWhiteSpace(result.item.token)

    const token = result?.item?.token
    let ttl: number = null

    if (isVerification && token) {
        const decodeResult = jwt.decode(token) as { exp: number }
        if (!decodeResult) {
            throw new AppError({ message: 'decode error', code: ResultCode.serverError })
        }
        ttl = Math.round(decodeResult.exp - luxon.DateTime.local().toSeconds())
    }
    return [isVerification, token, ttl]
}

async function checkUserTokenIsNeedRefresh(userToken: string, res: e.Response): Promise<string> {
    const decodeToken = jwt.decode(userToken) as { exp: number }

    // 大於 10 分鐘則不重新 refresh
    if (decodeToken.exp - luxon.DateTime.local().toSeconds() > 600) {
        return userToken
    }

    const userVerificationSvc = Container.get(UserVerificationSvc)

    try {
        const token = await userVerificationSvc.refreshToken(userToken)
        console.log(`====== new token`, token)
        const decodeResult = jwt.decode(token) as { exp: number }

        res.cookie('user-token', token, {
            expires: luxon.DateTime.fromSeconds(decodeResult.exp).toJSDate(),
            httpOnly: true,
        })

        return token
    } catch (error) {
        return userToken
    }
}



export default router
