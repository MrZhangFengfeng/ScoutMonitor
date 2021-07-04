import ErrorStackParser from 'error-stack-parser';
import { BaseError, ErrorType, TrackerEvents } from '../types/index';
import stringify from 'json-stringify-safe';
import { mktEmitter } from './events';



export interface MktTrackerOptions {

}

export interface MktError extends BaseError {
    msg: string | Event,
    line: number | undefined,
    column: number | undefined,
    stackTrace: string
}

export interface MktCacheError {
    [errorMsg: string]: number
}

export interface MktUnHandleRejectionError {

}

export class ErrorObserver {
    public _options;
    private _cacheError: MktCacheError;

    constructor(options: MktTrackerOptions) {
        this._cacheError = {};
        this._options = options;
    }

    init():void {
        const oldOnError = window.onerror;
        const oldUnHandleRejection = window.onunhandledrejection;

        window.onerror = (...args) => {
            if(oldOnError) {
                oldOnError(...args)
            }

            const [msg, url, line, column, error] = args

            const stackTrace = error ? ErrorStackParser.parse(error) : [];
            const msgText = typeof msg === 'string' ? msg : msg.type
            const errorObj: MktError = {
                msg: msgText,
                url, 
                line,
                column,
                stackTrace: stringify(stackTrace),
                errorType: ErrorType.jsError,
                context: this
            }

            // 统计报错次数
            if(typeof this._cacheError[msgText] !== 'number') {
                this._cacheError[msgText] = 0
            } else {
                this._cacheError[msgText] += 1
            }

            const repeat = (this._options.error as MktErrorOptions).repeat;
            if(this._cacheError[msgText] < repeat) {
                mktEmitter.customEmit(TrackerEvents.jsError, errorObj);
            }
        }

        window.onunhandledrejection = (error: PromiseRejectionEvent) => {
            if(oldUnHandleRejection) {
                oldUnHandleRejection.call(window, error)
            }

            const errorObj: MktUnHandleRejectionError = {
                msg: error.reason,
                errorType: ErrorType.unHandleRejectionError,
                context: this
            }

            mktEmitter.customEmit(TrackerEvents.unHandleRejection, errorObj)
        }

        // 监控资源类型报错，js link  image等加载失败情况
        window.addEventListener('error', (event) => {
            const target: any = event.target
            const isElementTarget = 
                target instanceof HTMLScriptElement ||
                target instanceof HTMLLinkElement ||
                target instanceof HTMLImageElement;
            
            if(!isElementTarget) {
                return false;
            }

            const url = target.src || target.href

            const errorObj: BaseError = {
                url,
                errorType: ErrorType.resourceError,
                context: this
            }

            mktEmitter.customEmit(TrackerEvents.resourceError, errorObj)
        }, true) //false:冒泡  true: 捕获
    }
}