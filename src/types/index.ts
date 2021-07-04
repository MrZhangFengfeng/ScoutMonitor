export enum ErrorType {
    unHandleRejectionError= 'unHandleRejectionError',
    jsError= 'jsError',
    resourceError= 'resourceError',
    httpRequestError= 'httpRequestError'
}

export interface BaseError {
    url?: string | undefined,
    path?: string | undefined,
    errorType: ErrorType,
    context?: any
}

export enum TrackerEvents {
    /* SDK expose events */
    performanceInfoReady = 'performanceInfoReady',
    reqStart = 'reqStart',
    reqEnd = 'reqEnd',
    reqError = 'reqError',
    jsError = 'jsError',
    vuejsError = 'vuejsError',
    unHandleRejection = 'unHandleRejection',
    resourceError = 'resourceError',
    batchErrors = 'batchErrors',
    mouseTrack = 'mouseTrack',
    event = 'event'
}

export interface MktAjaxRequest {
    context: any
}

export interface MktAjaxResponse {
    duration: number
    requestUrl: string
    response: object
    context: object
    status: number
}

export interface mktAjaxError {
    requestMethod: string
    requestUrl: string
    requestData: any
    errorType: string
    context: object
    status: number
}

export interface MktFetchRequest {
    url: string,
    options: object
}

export interface MktFetchResponse {
    requestUrl: string
    requestMethod: string
    requestData: object | string
    response: object
    duration: number
    context: object
    status: number
}

export interface MktFetchError {
    requestMethod: string
    requestUrl: string
    requestData: object | string
    errorMsg: string
    errorType: ErrorType.httpRequestError
}

export interface ReportParams {
    url: string
    data: any
}