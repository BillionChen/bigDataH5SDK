import console from '../utils/console';
import columns from '../config/columns';
import config from '../config';
class UserAgent {
    constructor () {
        this.data = sessionStorage.getItem(this.storageKey) && sessionStorage.getItem(this.storageKey) !== 'undefined' ?
            JSON.parse(sessionStorage.getItem(this.storageKey)) :
            this._getUserAgent();
        // console.log('userAgent:', this.data);
    }

    // 获取并缓存ua
    _getUserAgent() {
        var deviceInformation = ""; //设备信息
        var usystem = ""; //操作系统
        // navigator 对象是浏览器自带的，可以直接调用获取信息
        var str = navigator.userAgent.toLowerCase();
        var uretion = ""; //系统版本
        if (/(iPhone|iPad|iPod|iOS|mac)/i.test(navigator.userAgent)) {
            var ver = str.match(/ os (.*?) like mac os/);
            var width = window.screen.width;
            // ubrand = "iphone";
            usystem = "ios";
            uretion = ver[1];
            //设备信息
            var i = str.match(/[(\b]/).index;
            var s = str.match(/[)\b]/).index + 1;
            deviceInformation = str.substring(i, s);
            //操作系统，PC端有系统版本
        } else if (/(Android)/i.test(navigator.userAgent)) {
            var ver = str.match(/android (.*?); (.*?)build/);
            usystem = "android";
            uretion = ver[1];
            //设备信息
            var i = str.match(/[(\b]/).index;
            var s = str.match(/[)\b]/).index + 1;
            deviceInformation = str.substring(i, s);
        } else {
            usystem = "window";
            //设备信息
            var i = str.match(/[(\b]/).index;
            var s = str.match(/[)\b]/).index + 1;
            deviceInformation = str.substring(i, s);
            var ver = deviceInformation.split(";");
        
            //根据nt版本判断操作系统
            if (deviceInformation.search("6.1")) {
                uretion = "win7";
            } else if (deviceInformation.search("6.2")) {
                uretion = "win8";
            } else if (deviceInformation.search("6.3")) {
                uretion = "win8.1";
            } else if (deviceInformation.search("10.0")) {
                uretion = "win10";
            } else {
                uretion = "win xp";
            }
        }
        let rs = {
            [columns.deviceInformation]: deviceInformation,//设备信息
            [columns.usystem]: usystem,//操作系统
            [columns.uretion]: uretion,//系统版本
            [columns.resolution]: window.screen.width * window.devicePixelRatio + "," + screen.height * window.devicePixelRatio, //获取屏幕实际分辨率
        };
        sessionStorage.setItem(this.storageKey, JSON.stringify(this.data));
        return rs;
    }

    get storageKey () {
        return config.STORAGE_PREFIX + config.STORAGE_USER_AGENT;
    } 

    get data () {
        return this._data;
    }

    set data (v) {
        this._data = v;
    }
}

// 此处待定ua的storage的key
export default new UserAgent();