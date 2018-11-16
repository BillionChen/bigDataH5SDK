import console from '../utils/console';
//产生随机用户ID
class Uuid {
    constructor() {
        this.value = this._generateId();
        // console.log('生成了uuid：', this.value);
    }

    get value() {
        return this._value;
    }

    set value (v) {
        this._value = v;
    }

    _generateId() {
        var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        var tmpid = [];
        var r;
        tmpid[8] = tmpid[13] = tmpid[18] = tmpid[23] = '-';
        tmpid[14] = '4';
        for (var i = 0; i < 36; i++) {
            if (!tmpid[i]) {
                r = 0 | Math.random() * 16;
                tmpid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
            }
        }
        return tmpid.join('');
    }
}

export default Uuid;