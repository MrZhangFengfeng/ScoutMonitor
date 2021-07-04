import stringify from "json-stringify-safe";
import { ReportParams } from '../types/index'

export class Reporter {
    private _options
    private _data
    constructor(options:any, data:object) {
        this._options = options
        this._data = data
    }
    reporter(params: ReportParams) {
        fetch(params.url, {
            method: 'POST',
            body: params.data
        })
    }

    handleReport(errorList:Array<any>) {
        if (!errorList.length) return

        const { reportUrl } = this._options;
        this.reporter({
            url: reportUrl,
            data: errorList
        })
    }    
}