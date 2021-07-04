/*
* 核心监控类
*/
import merge from 'deepmerge';
import { mktEmitter } from './events';
import {
    ErrorObserver,
    MktError,
    MktUnHandleRejectionError
} from './errorObserver';
import { TrackerEvents } from '../types/index'
import { MktAjaxInterceptor } from './ajaxInterceptor'
import { MktFetchInterceptor } from './fetchInterceptor'
import { Reporter } from './report'
import { getDeviceInfo, MktDeviceInfo } from './device'
import { isObject, getNetworkType } from './utils';
import deepcopy from 'deepcopy';

export type ErrorCombine = MktError | MktUnHandleRejectionError;

export enum Env {
    Dev = 'dev',
    Sandbox = 'sandbox',
    Production = 'production'
}

export interface MktErrorOptions {
    watch: boolean;
    random: number;
    repeat: number;
    delay: number;
}

export interface MktHttpOptions {
    fetch: boolean;
    ajax: boolean;
}

export enum ConsoleType {
    log = 'log',
    error = 'error',
    warn = 'warn',
    info = 'info',
    debug = 'debug'
}

export interface MktBehaviorOption {
    watch: boolean;
    consle: ConsoleType;
    click: boolean;
    queueLimit: number;
}

export interface MktRrwebOption {
    watch: boolean;
    queueLimit: number;
    delay: number;
}

export interface MktTrackerOptions {
    env: Env;
    error: MktErrorOptions;
    http: MktHttpOptions;
    data: MktData;
    reportUrl: string;
    isSpa: boolean;
    // behavior: MktBehaviorOption;
    // rrweb: MktRrwebOption;
    // performance: boolean;
}

export type MktData = Record<string, unknown>

export type MktTrackerOptionsKey = keyof MktTrackerOptions;

export const defaultInitOptions: MktTrackerOptions = {
    env: Env.Dev,
    reportUrl: '',
    data: {},
    error: {
        watch: true,
        random: 1,
        repeat: 5,
        delay: 1000
    },
    http: {
        ajax: true,
        fetch: true
    },
    isSpa: true
}

export default class ScoutMonitor {
    public static instance: ScoutMonitor

    public errorObserver: ErrorObserver

    public ajaxInterceptor: MktAjaxInterceptor

    public fetchInterceptor: MktFetchInterceptor

    public reporter: Reporter

    public initOptions = defaultInitOptions

    public globalData: MktData = {}

    constructor(options:Partial<MktTrackerOptions> | undefined) {
        
    }

    /**
     * @description 设置全局数据
     * @param options 
     * @param deepmerge 
     */
    setGlobalData(
        key: string, 
        value: Record<string, unknown> | string | number | Array<any>,
        deepmerge?:boolean
    ):ScoutMonitor;
    setGlobalData(
        options:Record<string, unknown>, 
        deepmerge?:boolean
    ):ScoutMonitor;
    setGlobalData(
        key: Record<string, unknown> | string,
        value:
          | Record<string, unknown>
          | string
          | number
          | boolean
          | Array<any> = true,
        deepmerge = true
      ): ScoutMonitor  {
        if(typeof key === 'string') {
            if(deepmerge) {
                this.globalData = merge(this.globalData, value as Record<string, unknown>)
            } else {
                this.globalData[key as string] = value
            }
        } else if(isObject(key)){
            if (typeof value !== "boolean") {
                throw new Error("deepmerge should be boolean");
            }

            deepmerge = value
            value = key
            if(deepmerge) {
                this.globalData = merge(this.globalData, value)
            } else {
                this.globalData = {...this.globalData, ...value}
            }
        }

        mktEmitter.emit("_globalDataChange", this.globalData);

        return this
    }

    getDeviceInfo() {
        const deviceInfo = getDeviceInfo()

        Object.keys(deviceInfo).forEach(key => {
            this.setGlobalData({
                [`_${key}`]: deviceInfo[key as keyof MktDeviceInfo]
            })
        })
    }

    getNetworkType() {
        const networkType = getNetworkType()
        this.setGlobalData({
            'networkType': networkType
        })
    }

    getUserAgent(): void {
        this.setGlobalData({
          'userAgent': navigator.userAgent
        })
    }

    /**
     * 注入实例并初始化
     */
    init():void {
        this.reporter = new Reporter(this.initOptions, this.globalData)

        if(this.initOptions.error.watch) {
            this.errorObserver = new ErrorObserver(this.initOptions)
            this.errorObserver.init()
        }

        if(this.initOptions.http.fetch) {
            this.fetchInterceptor = new MktFetchInterceptor(this.initOptions)
            this.fetchInterceptor.init()
        }

        if(this.initOptions.http.ajax) {
            this.ajaxInterceptor = new MktAjaxInterceptor(this.initOptions)
            this.ajaxInterceptor.init()
        }
    }
}