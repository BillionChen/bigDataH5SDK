import config from '../config';
import columns from '../config/columns';
import user from './user';
import userAgent from '../function/userAgent';
import address from '../function/addr';

let storageKey = config.STORAGE_PREFIX + config.STORAGE_PAGE;

let pageObj =  null;

const setPageObj = function (last, current) {
    let lastPageObj = last || pageObj || sessionStorage.getItem(storageKey) &&
    sessionStorage.getItem(storageKey) !== 'undefined' ?
    JSON.parse(sessionStorage.getItem(storageKey)) : {
        interview: null,
        title: null,
        url: null
    };
    let currentPageObj = current || {
        title: document.title,
        url: window.location.href,
        interview: new Date().getTime(),
    };
    pageObj = {
        lastPageObj: {// 这里重新记录一下上个页面
            interview: lastPageObj.interview,
            title: lastPageObj.title,
            url: lastPageObj.url
        },
        ...currentPageObj
    };
    // ps: 这里好粗糙啊，只能兼容单页面应用；app新开webview需要另外一种写法，需要监听关闭webview
    // 如果刷新，则不保存
    if (pageObj.lastPageObj.url !== pageObj.url) {
        sessionStorage.setItem(storageKey, JSON.stringify(pageObj));
    }
}

const getPageObjData = function () {
    return pageObj ? {
        [columns.interview]: pageObj.interview,// 进入页面的时间
        [columns.currentUrl]: urlFilter(pageObj.url),//当前页面的URL
        [columns.title]: pageObj.title,// 当前页面的标题
        [columns.referrerUrl]: urlFilter(pageObj.lastPageObj.url),//上个页面的URL
        [columns.referrerTitlt]: pageObj.lastPageObj.title,//上一个页面的标题
    } : {
        [columns.title]: document.title,
        [columns.currentUrl]: window.location.href,
        [columns.interview]: new Date().getTime(),
        [columns.referrerUrl]:null,
        [columns.referrerTitlt]:null
    };
}

// 报告跳转事件
export const pageView = function (last, current) {
    // 设置初次访问时间
    setTimeout(function() {
        setPageObj(last, current);
        user.updateLastVisitTime();
        let data = setUpData({
            [columns.eventName]: 'p_v', // 这里配置事件名称
            [columns.eventDate]: null,// 事件发生时的时间
            [columns.userCname]: null,// 按钮名称
        })
        send(data);
    });
}

// 报告点击事件
export const clickEvent = function (e) {
    // console.log('点击');
    let tg = getClickTarget(e.target);
    // console.log('触发了点击', tg);
    user.updateLastVisitTime();
    if (tg) {
        let actionName = tg.getAttribute("JRDSJ_text") || tg.textContent.match(/[\u4e00-\u9fa5]/g).join("") || null;
        let data = setUpData({
            [columns.eventName]: 'e_e', // 这里配置事件名称
            [columns.eventDate]: new Date().getTime(),// 事件发生时的时间
            [columns.userCname]: actionName,// 按钮名称
        })
        send(data);
        user.updateLastVisitTime();
    }
}

const getClickTarget = function (node, lv) {
    // 默认button标签、a标签、有点击类的标签需要采集并发送数据
    // if (tg.nodeName === 'BUTTON' || tg.nodeName === 'A' || tg.classList.contains('MD_JRDSJ__click')) {
    lv = lv || 1;
    if (node.classList.contains('MD_JRDSJ__click') || node.getAttribute("JRDSJ") !== null) {
        return node;
    } else if (lv <= 3 && node.parentNode.nodeName !== 'BODY') {
        return getClickTarget(node.parentNode, lv++);
    } else {
        return null
    }
}

// 监听点击事件
const clickWatch = function () {
    if(document.addEventListener){
        document.addEventListener("click", clickEvent, true);
    }else if(document.attachEvent){//兼容IE
        document.attachEvent("click", clickEvent);
    }
}

clickWatch();

// 报告自定义事件
export const customEvent = function (data) {
    user.updateLastVisitTime();
    let mydata = setUpData({
        [columns.eventName]: 'p_e', // 这里配置事件名称
        [columns.eventDate]: new Date().getTime(),// 事件发生时的时间
        [columns.userCname]: '自定义事件',// 按钮名称
    })
    for(let i in data){//遍历属性
        mydata["pm_"+i]=data[i];//防止冲突加上前缀pm
    }
    send(mydata);
}

function urlFilter (url) {
    return url
}

// 组合数据
function setUpData (data) {
    return {
        [columns.platform]: config.PLATFORM,// 系统平台
        ...userAgent.data,// ua相关信息
        ...address.data,// 地址相关信息
        ...user.data,// 用户信息
        ...getPageObjData(),
        ...data // 传入的参数
    }
}

// 发送到服务器
function send(data) {
    if (typeof data !== 'string') data = JSON.stringify(data);
    //创建一个图片对象,参数为宽度和高度
    var i2 = new Image(1, 1);
    //图片加载过程中发生错误时调用的事件句柄
    i2.onerror = function (error) {
        // 这里可以进行重试操作
    };
    //更改i2的src然后会访问所在位置，服务器会记录访问日志
    i2.src = config.SERVER_URL + "?data=" + encodeURIComponent(data);
}
