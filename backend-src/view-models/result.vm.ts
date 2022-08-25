export interface BaseResult {
    success: boolean
    code: ResultCode
    message?: string;
}

export interface APIResult<T = {}> extends BaseResult {
    item?: T
}

export interface APIListResult<T = {}> extends BaseResult {
    items: T[]
    page: PaginationResult
}

export enum ResultCode {
    success = 'success',
    clientError = 'clientError',
    userVerificationError = 'userVerificationError',
    tokenVerificationError = 'tokenVerificationError',
    serverError = 'serverError',
    unknown = 'unknown'
}

export interface PaginationResult {
    dataAmount: number
    pageSize: number
    pageIndex: number
    pageAmount: number
}

export function getAPIResult<T>(item: T): APIResult {
    return {
        item,
        code: ResultCode.success,
        success: true
    }
}

export function getAPIListResult<T>(items: T[], page: PaginationResult): APIListResult {
    return {
        items,
        code: ResultCode.success,
        success: true,
        page
    }
}