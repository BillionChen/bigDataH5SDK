export default {
    NODE_ENV: 'prod',// 环境名称
    BAIDU_MAP_AK: '',
    STORAGE_PREFIX: 'mdf_',// 存储变量命名空间/前缀
    STORAGE_ADDRESS: 'address_info',// 地址存储
    STORAGE_USER_AGENT: 'user_agent_info',// ua存储
    STORAGE_USERINFO: 'user_info',// 用户列表存储
    STORAGE_PAGE:'page_info',// 保存当前页面和之前页面的信息

    CONSOLE_DEBUG: false,
    CONSOLE_LOG: false,
    CONSOLE_INFO: true,
    CONSOLE_WARN: true,

    SERVER_URL: 'http://localhost:8080/dsj/',

    SESSION_TIMEOUT: 600,// 单位秒,默认 10分钟

    // 以下为配置项
    USERNAME_KEY: '',// 用户名取值字段
    PLATFORM: '',// 平台名称
    AUTO_PV: false,// 进入页面或者刷新时自动调用pageView开关
}