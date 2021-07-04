export function isObject(obj:any):boolean {
    return Object.prototype.toString.call(obj) === '[object Object]'
}

export function getPageUrl():string {
    return window.location.href;
}

export function getUvlabel():string {
    const date = new Date();
    let uvLabel = localStorage.getItem('weaklight_uv') || '';
    const datetime = localStorage.getItem('weaklight_uv_time') || '';
    const today = date.getFullYear() + '/' + (date.getMonth() + 1) + '/' + date.getDate() + ' 23:59:59';

    if((!uvLabel && !datetime) || date.getTime() > Number(datetime)) {
        uvLabel = randomString();
        localStorage.setItem('weaklight_uv', uvLabel);
        localStorage.setItem('weaklight_uv_time', String(new Date(today).getTime()));
    }

    return uvLabel
}

export function randomString(len?: number):string {
    len = len || 10;
    const chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz123456789';
    const maxPos = chars.length;
    let pwd = '';
    for(let i=0;i<len;i++) {
        pwd += chars.charAt(Math.floor(Math.random()) * maxPos);
    }

    return pwd + new Date().getTime()
}

export function getNetworkType(): string {
    return (navigator as any).connection
      ? (navigator as any).connection.effectiveType
      : "";
}