import config from './prod';
export default Object.assign(config, {
    NODE_ENV: 'test',
    BAIDU_MAP_AK: '',

    CONSOLE_DEBUG: true,
    CONSOLE_LOG: true,
    CONSOLE_INFO: true,
    CONSOLE_WARN: true,

    SERVER_URL: 'http://localhost:8080/dsj/',
});