// 格式化参数
function formatParams (data, needEncode) {
    var arr = [];
    for (var name in data) {
        arr.push(needEncode
            ? encodeURIComponent(name) + '=' + encodeURIComponent(data[name])
            : name + '=' + data[name]);
    }
    return arr.join('&');
}
/*
options = {
    url,
    data,
    callbackName,
    needEncode,
    time,
    success
    error
}
*/

export default function jsonp (options = {}) {
    // jsonp必须带url, callback属性
    if (!options.url) throw new Error('参数不合法');

    // 如果url中指明了callback，则需要定义callbackName，否则自动生成
    var callbackName = options.callbackName || ('callback' + Math.random()).replace('.', '');

    // 赋值到data中
    if (options.data) options.data.callback = callbackName;

    // 根据data生成参数
    var params = formatParams(options.data, options.needEncode);

    // 创建 script 标签并加入到页面中
    var oHead = document.getElementsByTagName('head')[0];
    var oS = document.createElement('script');
    oHead.appendChild(oS);

    // 创建jsonp回调函数
    // callbackName = callbackName.split('0')[0];
    window[callbackName] = function (json) {
        oHead.removeChild(oS);
        clearTimeout(oS.timer);
        window[callbackName] = null;
        options.success && options.success(json);
    };

    // 发送请求， 如果没有参数，则直接用url
    oS.src = params ? options.url + '?' + params : options.url;

    // 超时处理
    if (options.time) {
        oS.timer = setTimeout(function () {
            window[callbackName] = null;
            oHead.removeChild(oS);
            options.error && options.error({ message: '超时' });
        }, options.time);
    }
};;
/* jsonp({
    url: 'http://localhost:8080/ac/test.php',
    data: { q: 1 },
    callbackName: 'foo',
    time: 1,
    success: function (json) {
        // 此处放成功后执行的代码
        console.log(json.name);
    },
    error: function (json) {
        console.log(json.message);
    }
}); */
