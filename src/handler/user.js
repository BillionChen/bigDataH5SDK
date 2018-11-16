import Uuid from '../function/uuid';
import config from '../config';
import columns from '../config/columns';

class User {
    // 构造方法，读取已有的用户列表信息，如果为空，则生成一个游客
    constructor () {
        this.userlist = sessionStorage.getItem(this.storageKey) && sessionStorage.getItem(this.storageKey) !== 'undefined' ?
            JSON.parse(sessionStorage.getItem(this.storageKey)) :
            [this._generateVisitorInfo()];
    }

    // 生成游客信息
    _generateVisitorInfo () {
        return {
            uuid: new Uuid().value,//生成uuid
            status: true,// 激活状态，标识当前用户
            login: false,// 登录状态，区分游客和用户
            info: { // 用户信息
                // username: '游客'
            },
            // 会话id，一个用户可能存在多个会话，会话超过超时时间后
            sessionId: new Uuid().value,
            lastVisitTime: new Date().getTime(),// 最后访问时间，用于划分会话
        }
    }

    updateLastVisitTime () {
        let info = this.userlist.find(x => x.status);
        let time = new Date().getTime();
        let lastVisitTime = info.lastVisitTime;
        // 会话时间超过十分钟，更新会话id
        if(time - lastVisitTime > config.SESSION_TIMEOUT * 1000) {
            info.sessionId = new Uuid().value;
        }
        info.lastVisitTime = time;
    }

    get info () {// 提供只读的用户信息
        return this.userlist.find(x => x.status)
    }

    // 提供只读的用户信息用于组合给后台记录操作
    get data () {
        return {
            [columns.uname]: this._getInfoKeyValue(this.info.info),
            [columns.uonly]: this.info.uuid,
            [columns.sid]: this.info.sessionId,
            [columns.ifLogin]: this.info.login,
        }
    }
    // item(uuid+状态+信息): {uuid: String, status: Bool, info: Object}
    // get userlist () {// userlist是一个Array
    //     return this._userlist;
    // }
    // set userlist (v) {// 每次修改userlist时需要保存session
    //     this._userlist = v;
    // }

    _cache () {// 缓存保存
        sessionStorage.setItem(this.storageKey, JSON.stringify(this.userlist));
    }

    // 获取用户信息关键值（唯一标识）
    // 有的用户信息里面可能不是username作为唯一标识，所以目前采用配置加降级获取信息
    _getInfoKeyValue (info) {
        return (config.USERNAME_KEY ?
            info[config.USERNAME_KEY] :
            (info.id || info.username)) || '游客'
    }

    /**
     * 登录操作需要把登录成功后的个人信息传入到此接口
     * @param {Object/String} info 登录返回的信息包含用户名手机号等
     * 必须包含username或者其他唯一编码赋值到username中
     */
    login (info) {
        if (!info) {
            console.error('调用大数据登录时需要带用户信息对象参数');
            return false;
        }
        if (typeof info === 'string') info = {username: info};
        // 判断是否曾经登录过
        let find = this.userlist.find(x => this._getInfoKeyValue(x.info) === this._getInfoKeyValue(info));
        this.userlist.find(x => x.status).status = false;// 将其他的激活状态改为false
        if (find) { // 登录过的重新激活登录状态
            find.status = true;
            this.updateLastVisitTime();
        } else {//未登录过的生成一个登录记录
            this.userlist.push({
                uuid: new Uuid().value,//生成uuid
                status: true,// 激活状态，标识当前用户
                login: true,// 登录状态，区分游客和用户
                info, // 用户信息
                sessionId: new Uuid().value,
                lastVisitTime: new Date().getTime(),
            })
        }
        this._cache();
        // ps:这里后面估计会增加发送到服务器操作
    }

    /**
     * 退出登录需要调用此接口以更改uuid标识不同的用户
     */
    logout () {
        let find = this.userlist.find(x => x.status);
        if (find) {
            find.status = false;
            find.lastVisitTime = new Date().getTime();
        }
        let visitor = this.userlist.find(x => !x.login);
        visitor.status = true;
        this.updateLastVisitTime();
        this._cache();
        // ps:这里后面估计会增加发送到服务器操作
    }

    get storageKey () {
        return config.STORAGE_PREFIX + config.STORAGE_USERINFO
    }
}

export default new User();