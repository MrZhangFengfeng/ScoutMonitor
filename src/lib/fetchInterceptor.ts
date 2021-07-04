import { MktTrackerOptions } from './monitor'
import { MktFetchRequest, TrackerEvents, MktFetchResponse, ErrorType, MktFetchError } from '../types/index'
import { mktEmitter } from './events'

export class MktFetchInterceptor {
    private _options;
    constructor(options: MktTrackerOptions) {
        this._options = options
    }

    init():void {
        const that = this
        const originFetch = window.fetch

        Object.defineProperty(window, 'fetch',{
            configurable: true,
            enumerable: true,
            get() {
                return (url: string, options: any = {}) => {
                    this._url = url,
                    this._method = options.method || 'get',
                    this._data= options.body || {}

                    const startTime: number = Date.now();
                    const request: MktFetchRequest = {
                        url,
                        options
                    };
                    mktEmitter.customEmit(TrackerEvents.reqStart, request)

                    return originFetch(url, options)
                            .then(res => {
                                // 想要精确的判断 fetch() 是否成功，需要包含 promise resolved 的情况，此时再判断 Response.ok 是不是为 true。
                                const status = res.status
                                
                                if(res.ok) {
                                    const response: MktFetchResponse = {
                                        requestUrl: res.url,
                                        requestMethod: this._method,
                                        requestData: this._data,
                                        response: res.json(),
                                        duration: Date.now() - startTime,
                                        context: this,
                                        status
                                    }
                                    mktEmitter.customEmit(TrackerEvents.reqEnd, response)
                                } else {
                                    const error: MktFetchError = {
                                        requestMethod: this._method,
                                        requestUrl: this._url,
                                        requestData: this._data,
                                        errorMsg: res.statusText,
                                        errorType: ErrorType.httpRequestError
                                    };
                                    mktEmitter.customEmit(TrackerEvents.reqError, error)
                                }
                            })
                            .catch((e:Error) => {
                                const error: MktFetchError = {
                                    requestMethod: this._method,
                                    requestUrl: this._url,
                                    requestData: this._data,
                                    errorMsg: e.message,
                                    errorType: ErrorType.httpRequestError
                                };
                                mktEmitter.customEmit(TrackerEvents.reqError, error)
                            })
                }
            }
        })
    }
}