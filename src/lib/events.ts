import { EventEmitter} from 'events';
import { getPageUrl, isObject, getUvlabel } from './utils';
import { TrackerEvents } from '../types/index'

export class MktEmitter extends EventEmitter {
    private globalData: any;

    constructor() {
        super()
        this.init();
    }

    private basicEmit(event: string | symbol, ...args: any[]): boolean {
        const [data, ...rest] = args
        
        if(!isObject(data)) {
            return super.emit(event, ...args)
        }

        // 调用数据预处理
        if(typeof data.beforeEmit === 'function') {
            data.beforeEmit.call(this, data)
            Reflect.deleteProperty(data, 'beforeEmit')  // 相当于  delete data.beforeEmit
        }

        super.emit(TrackerEvents.event, event, data, ...rest);
        return super.emit(event, data, ...rest);
    }

    public customEmit(event: string | symbol, ...args: any[]): boolean {
        const [data, ...rest] = args
        return this.basicEmit(event, {
            ...data,
            beforeEmit: (data: any) => {
                this.formatData(data)
            },
            ...rest
        })
    }

    // 数据处理
    private formatData(data: any) {
        data.time = Date.now();
        data.globalData = this.globalData;

        // 用页面名称给数据命名
        if(!data.title) {
            data.title = document.title
        }

        if(!data.url) {
            data.url = getPageUrl()
        }

        // referrer
        if(!data.preUrl) {
            data.preUrl = document.referrer && document.referrer !== location.href ? document.referrer : ''
        }

        // uv laberl
        if(!data.uvLabel) {
            data.uvLabel = getUvlabel()
        }
    }

    init() {
        this.globalData({});
        this.on('_globalDataChange', (globalData)=>{
            this.globalData = globalData
        })
    }
}

export const mktEmitter = new MktEmitter();