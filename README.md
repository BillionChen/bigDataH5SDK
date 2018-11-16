# bigDataH5SDK

## 需求描述

当前系统需求为`采集 h5 开发应用的用户行为数据`
包括但不限于以下几点：

1. 可灵活配置，根据不同项目生成代码
2. 可多维拓展，预留增加用户行为方式等维度接口
3. 支持模块化
4. 项目内自我测试
5. 规范化的接入方式
6. 完善的使用手册
7. 支持debug模式

* 传入经纬度直接jsonp调用百度api接口
* 刷新sdk-uuid接口，用于进入页面/登录/退出登录
* 获取userAgent接口，进入页面自动调用并存储
* cookie操作类
* 触发阶段监听点击事件
* 监听事件配置属性

## 总体方案

1. 用新的模块化代码分别编写整个流程的各个小功能，分别编写便于维护，`src`文件夹
2. 根据不同项目的不同配置用`browserify`分别打包，`build.js`文件
3. 在本项目内编写对应的测试例子，`example`文件夹

## 详细设计

H5数据采集分为以下几个阶段：

1. 获取userAgent，获取地址等一次性的操作
2. 生成唯一编码，记录用户
3. 捕获事件，或者用户传入自定义动作
4. 发送数据到服务器

* 所有发送到服务器的数据配置在`./src/config/columns.js`里面
* 生产环境的配置在`./src/config/prod.js`里面，测试环境继承生产环境的配置并覆盖部分配置
* 打包时，会根据不同的命令，将生产或者测试环境的文件复制成`./src/config/index.js`文件用于加载，此文件不必修改
* `./src/function/`文件夹包含了地址/ua/uuid等功能，处理主流程以外的系统数据用户数据
* `./src/handler/user.js`实现了记录用户列表/登录状态并修改等操作，并向外提供用户信息
* `./src/handler/event.js`实现了点击事件的捕抓，页面跳转事件，自定义事件等上报逻辑，是主流程逻辑  
* 数据传送时会自动组合 `./src/function/addr.js`, `./src/function/userAgent.js`, `./src/handler/user.js` 中提供的数据一并发送无需手动操作  
* 这些数据均是单例模式，若非修改只会执行一次
* `./src/index.js`是入口文件，将所有小型功能组合导出到`window.__AE__`下

```javascript
// __AE__ 的内部结构
{
    setAddress,// 设置地址，传入经度/纬度，自动调用百度的jsonp接口获取地址
    login, // 告诉大数据sdk这个用户登录，新建一个uuid以存储操作
    logout, // 告诉大数据sdk这个用户退出，还原到原来的游客uuid
    // 登录和退出方法目前均没有调用发送数据到后台方法
    pageView, // 进入页面会自动采集一次pv，但单页应用需要跳转时手动调用此方法
    customEvent, // 用户自定义事件/数据上传，传入一维数据json
    clickEvent, // 点击事件或者其他html事件上报（点击事件已自动捕获，不需要另行捕获）传入事件e
    // 默认button标签、a标签、有点击类名 MD_JRDSJ__click 的标签需要采集并发送数据
    // 采集上报的按钮名称默认先取 JRDSJ_text 属性的内容，若无，则采集按钮的中文内容
    setOption // 初始化时调用，传入系统/平台名称等，也可以在加载js的script上写，后面介绍
}
```

## sdk打包流程

```bash
npm run build # 生产环境
npm run build-test # 测试环境
```

## sdk接入

```html
<body>
    <div>测试失败</div>
    <a>测试成功一</a>
    <button>测试成功二</button>
    <div class="MD_JRDSJ__click">测试成功三</div>
    <button JRDSJ_text="测试成功四文案lalala">测试成功四</button>
</body>
<script id="bigdata-sdk" src="bigdata-sdk.min.js?platform=你的系统名&username_key=userCode&auto_pv=true"></script>
```

```javascript
let __AE__ = require('./dist/bigdata-sdk.min.js');
__AE__.init({
    platform: '你的系统名',//你的系统名称
    username_key: 'userCode',// 登录时获取的唯一用户名字段
    // auto_pv: true, // 自动执行一次pv事件捕获，适合多页面应用
});
```

---

## License

[MIT](LICENSE)

## 贡献者

[陈炜标](mailto:980669507@qq.com)

## 资源包介绍

* [browserify](https://www.npmjs.com/package/browserify)：用于打包
* [babelify](https://www.npmjs.com/package/babelify)：用于es6转换
* [UglifyJS](https://gitee.com/virjar/UglifyJS3)：用于压缩代码

## 参考

* [阿里文件对象存储SDK](https://github.com/ali-sdk/ali-oss)
* [大数据之数据采集](https://www.jianshu.com/p/a8a7ee412688)
* [神策分析SDK](https://www.sensorsdata.cn/manual/js_sdk.html) 别家公司开发的sdk文档
* [[].slice.call(arguments,1)](https://blog.csdn.net/crper/article/details/51396063) 用于获取第二个开始的参数
* [navigator](http://www.w3school.com.cn/jsref/dom_obj_navigator.asp) 对象包含的属性描述了正在使用的浏览器。
* [babel7教程](https://blog.zfanw.com/babel-js/)
* [微信小程序无埋点数据收集方案-简书](https://www.jianshu.com/p/6c884b613c4c) 实际上在进行集成SDK的过程中开发者仍然要引入代码，并没有实现完全的无埋点，并且在进行点击等事件采集的时候，仍然需要开发者手动调用SDK统计接口。
* [微信小程序无埋点数据采集方案-掘金](https://juejin.im/post/5a3787626fb9a0451c3a7ef6)
* [揭开JS无埋点技术的神秘面纱](http://unclechen.github.io/2018/06/24/%E6%8F%AD%E5%BC%80JS%E6%97%A0%E5%9F%8B%E7%82%B9%E6%8A%80%E6%9C%AF%E7%9A%84%E7%A5%9E%E7%A7%98%E9%9D%A2%E7%BA%B1/)
