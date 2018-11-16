// 大数据采集经纬度
import jsonp from '../utils/jsonp';
import config from '../config';
import columns from '../config/columns';
import console from '../utils/console';
class Address {
    constructor() {
        this.value = sessionStorage.getItem(this.storageKey) && sessionStorage.getItem(this.storageKey) !== 'undefined' ?
            JSON.parse(sessionStorage.getItem(this.storageKey)) :
            null;
    }

    // ps: 百度地图和腾讯地图经纬度获取的值不一样
    setAddress (latitude, longitude) {
        return new Promise((resolve, reject) => {
            jsonp({
                url: 'https://api.map.baidu.com/geocoder/v2/',
                data: {
                    coordtype: 'wgs84ll',
                    ak: config.BAIDU_MAP_AK,
                    location: latitude + ',' + longitude,
                    output: 'json',
                    extensions_town: 'true'
                },
                callbackName: 'baidumapGetLocation',
                time: 5000,
                success: data => {
                    // console.log('jsonp getLocation success');
                    this.value = {
                        location: data.result.location,
                        formatted_address: data.result.formatted_address,
                        addressComponent: data.result.addressComponent
                    };
                    sessionStorage.setItem(this.storageKey, JSON.stringify(this.value));
                    // 此处放成功后执行的代码
                    resolve(this.value);
                },
                error: function (e) {
                    reject(e || new Error('获取地理数据失败，请检查网络'));
                }
            });
        });
    }

    get storageKey () {
        return config.STORAGE_PREFIX + config.STORAGE_ADDRESS;
    }

    set value (e) {
        this._value = e;
    }

    get value () {
        return this._value || {};
    }

    get location () {
        return this.value.location || {};
    }

    get addressComponent () {
        return this.value.addressComponent || {};
    }

    // 给最后组合数据用的
    get data () {
        return {
            [columns.longitude]: this.location.lng || null, //获取经度
            [columns.latitude]: this.location.lat || null, //获取纬度
            [columns.addr]: this.value.formatted_address || null, //获取详细地址
            [columns.country]: this.addressComponent.country || null, //获取国家
            [columns.province]: this.addressComponent.province || null, //获取省份
            [columns.city]: this.addressComponent.city || null, //获取城市
            [columns.district]: this.addressComponent.district || null, //获取县区
            [columns.town]: this.addressComponent.town || null, //获取镇
            [columns.street]: this.addressComponent.street || null //获取街道信息
        };
    }

}
export default new Address();

// 以下是jsonp接口返回结果格式
/* {
    'status': 0,
    'result': {
        'location': {
            'lng': 113.25017872995559,
            'lat': 22.9468554669509
        },
        'formatted_address': '广东省佛山市顺德区G105(京珠线)',
        'business': '陈村',
        'addressComponent': {
            'country': '中国',
            'country_code': 0,
            'country_code_iso': 'CHN',
            'country_code_iso2': 'CN',
            'province': '广东省',
            'city': '佛山市',
            'city_level': 2,
            'district': '顺德区',
            'town': '北滘镇',
            'adcode': '440606',
            'street': 'G105(京珠线)',
            'street_number': '',
            'direction': '',
            'distance': ''
        },
        'pois': [],
        'roads': [],
        'poiRegions': [],
        'sematic_description': '物流大厦附近46米',
        'cityCode': 138
    }
} */