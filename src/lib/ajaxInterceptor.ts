import { mktEmitter } from './events'
import { MktTrackerOptions } from './monitor'
import { TrackerEvents, MktAjaxRequest, MktAjaxResponse, ErrorType, mktAjaxError } from '../types/index'


export class MktAjaxInterceptor {
    private _options: object;
    constructor(options: MktTrackerOptions) {
        this._options = options
    }
    init():void {
        if(!XMLHttpRequest) return

        const { open, send } = XMLHttpRequest.prototype
        const request: MktAjaxRequest = {
             context: this
        }

        XMLHttpRequest.prototype.open = function (method: string, url: string) {
            this._method = method
            this._url = url
            mktEmitter.customEmit(TrackerEvents.reqStart, request)
            // true: async
            return open.call(this, method, url, true)
        }

        XMLHttpRequest.prototype.send = function(...rest:any) {
            const requestData = rest[0]
            const startTime = new Date().getTime()
            this.addEventListener('readystatechange', ()=>{
                if(this.readyState === 4) {
                    if(this.state >= 200 && this.state < 300) {
                        const response: MktAjaxResponse = {
                            duration: Date.now() - startTime,
                            requestUrl: this.responseURL,
                            response: this.response,
                            context: this,
                            status: this.status
                        }
                        mktEmitter.customEmit(TrackerEvents.reqEnd, response)
                    } else {
                        const error: mktAjaxError = {
                            requestMethod: this._method,
                            requestUrl: this._url,
                            requestData,
                            errorType: ErrorType.httpRequestError,
                            context: this,
                            status: this.status
                        }
                        mktEmitter.customEmit(TrackerEvents.reqError, error)
                    }
                }
            })

            return send.call(this, requestData)
        }
    }
}