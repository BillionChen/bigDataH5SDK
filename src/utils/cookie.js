export const CookieUtil = {
    // 设置cookie
    set : function (name, value, expires, domain, path, secure) {
        var cookieText = "";
        cookieText += encodeURIComponent(name) + "=" + encodeURIComponent(value);
        if (expires instanceof Date) {
            cookieText += "; expires=" + expires.toGMTString();
        }
        if (path) {
            cookieText += "; path=" + path;
        }
        if (domain) {
            cookieText += "; domain=" + domain;
        }
        if (secure) {
            cookieText += "; secure";
        }
        document.cookie = cookieText;
    },
    // name=value; expires=expiration_time; path=domain_path; domain=domain_name; secure
    // 获取cookie
    get : function (name) {
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = "";
        if (cookieStart > -1) {
            var cookieEnd = document.cookie.indexOf (";", cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
        }
        return cookieValue; 
    },
    // 删除cookie
    unset : function (name, domain, path, secure) {
        this.set(name, "", Date(0), domain, path, secure);
    },

    //将储存cookie
    setExt: function(name, value) {
        this.set(name, value, new Date().getTime() + 315360000000, "/");
    }
};
/* 
// 测试
CookieUtil.set("name", "zhang");
var name = CookieUtil.get("name");
alert(name);    // zhang
CookieUtil.unset("name");
alert(CookieUtil.get("name"));  // 空
 */
export const SubCookieUtil = {
    /** 设置一条完整的cookie
    *   param name : 表示cookie的名称，必填
    *   param subCookies : 表示cookie的值，为一个对象，必填
    *   param expires : 表示cookie的过期时间，可以不填
    *   param domain : 表示cookie的域名，可以不填
    *   param path : 表示cookie的路径，可以不填
    *   param secure : 表示cookie的安全标志，可以不填
    *   eg : SubCookieUtil.setAll("info", { name : "zhang", age : 23});
    **/
    setAll : function (name, subCookies, expires, domain, path, secure) {
        var cookieText = "", subName, cookieParts = [];
        cookieText += encodeURIComponent(name) + "=";
        for(subName in subCookies) {
            cookieParts.push(encodeURIComponent(subName) + "=" + encodeURIComponent(subCookies[subName]));
        }
        if (cookieParts.length > 0) {
            cookieText += cookieParts.join("&");
            if (expires instanceof Date) {
                cookieText += "; expires=" + expires.toGMTString();
            }
            if (path) {
                cookieText += "; path=" + path;
            }
            if (domain) {
                cookieText += "; domain=" + domain;
            }
            if (secure) {
                cookieText += "; secure";
            }
        } else {
            cookieText += "; expires=" + Date(0).toGMTString();
        }
        document.cookie = cookieText;
    },
    /** 设置一条子cookie
    *   param name : 表示cookie的名称，必填
    *   param subName : 表示子cookie的名称，必填
    *   param value : 表示子cookie的值，必填
    *   param expires : 表示cookie的过期时间，可以不填
    *   param domain : 表示cookie的域名，可以不填
    *   param path : 表示cookie的路径，可以不填
    *   param secure : 表示cookie的安全标志，可以不填
    *   eg : SubCookieUtil.set("info", "sex", "boy");
    **/
    set : function (name, subName, value, expires, domain, path, secure) {
        var cookies = this.getAll(name) || {};
        cookies[subName] = value;
        this.setAll(name, cookies, expires, domain, path, secure);
    },
    /** 读取一条完整cookie
    *   param name : 表示cookie的名称，必填
    *   return : 一个cookie对象
    *   eg : SubCookieUtil.getAll("info");
    **/
    getAll : function (name) {
        var cookieName = encodeURIComponent(name) + "=",
            cookieStart = document.cookie.indexOf(cookieName),
            cookieValue = "", i, len, subCookies, parts, result = {};
        if (cookieStart > -1) {
            var cookieEnd = document.cookie.indexOf (";", cookieStart);
            if (cookieEnd == -1) {
                cookieEnd = document.cookie.length;
            }
            cookieValue = decodeURIComponent(document.cookie.substring(cookieStart + cookieName.length, cookieEnd));
            if (cookieValue.length > 0) {
                subCookies = cookieValue.split("&");
                for (i = 0, len = subCookies.length; i < len; i++) {
                    parts = subCookies[i].split("=");
                    result[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
                }
                return result;
            }
        }
        return null;
    },
    /** 获取一条子cookie的值
    *   param name : 表示cookie的名称，必填
    *   param subName : 表示子cookie的名称
    *   return : 一个子cookie的值
    *   eg : SubCookieUtil.get("info", "name");
    **/
    get : function (name, subName) {
        var cookies = this.getAll(name);
        if (cookies) {
            return cookies[subName];
        } else {
            return null;
        }
    }, 
    /** 删除一条完整cookie
    *   param name : 表示cookie的名称，必填
    *   param domain : 表示cookie的域名，可以不填
    *   param path : 表示cookie的路径，可以不填
    *   param secure : 表示cookie的安全标志，可以不填
    *   eg : SubCookieUtil.unsetAll("info");
    **/
    unsetAll : function (name, domain, path, secure) {
        this.setAll(name, "", Date(0).toGMTString(), domain, path, secure);
    },
    /** 删除一条子cookie
    *   param name : 表示cookie的名称，必填
    *   param subName : 表示子cookie的名称，必填
    *   param domain : 表示cookie的域名，可以不填
    *   param path : 表示cookie的路径，可以不填
    *   param secure : 表示cookie的安全标志，可以不填
    *   eg : SubCookieUtil.unset("info", "name");
    **/
    unset : function (name, subName, domain, path, secure) {
        var cookies = this.getAll(name);
        if (cookies) {
            delete cookies[subName];
            this.setAll(name, cookies, null, domain, path, secure);
        }
    }   
};
/* 
// 测试：
var zhang = {
    name : "zhang",
    age : 23,
    height : "178cm",
    weight : "66kg"
}
// 设置一条完整的cookie
SubCookieUtil.setAll("zhang", zhang);
// 获取一条完整的cookie
var zhang = SubCookieUtil.getAll("zhang");
alert(zhang.weight);    // 66kg
// 再为张添加一个子cookie
SubCookieUtil.set("zhang", "sport", "basketball");
// 获取子cookie
alert(SubCookieUtil.get("zhang", "sport")); // basketball
// 删除一条子cookie
SubCookieUtil.unset("zhang", "age");
alert(SubCookieUtil.get("zhang", "age"));   // undefined
// 删除一条完整的cookie
SubCookieUtil.unsetAll("zhang");
alert(SubCookieUtil.getAll("zhang"));   // 报错，因为已经被删除
 */