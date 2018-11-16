const Client = require('ssh2').Client
const spawn = require("cross-spawn")
const path = require('path')
const ora = require('ora');
const glob = require("glob")
const env = process.argv[process.argv.length - 1].replace('--', '')
let config = require('./config.js')[env];
if (!config) {
    console.log(`找不到${env}环境用户配置文件`)
    return
}
const cwd = path.dirname(__dirname)

const spinner = ora('开始打包...').start();
const remotePath = config.remotePath

// const build = spawn('yarn', [`build:${env}`], {
const build = spawn('yarn', [`build-test`], {
    cwd: cwd
})
build.on('close', function(code) {
    if (code !== 0) {
        console.log('打包失败')
        spinner.stop()
        return
    }
    spinner.text = "打包完成，开始上传..."
    const  conn = new Client();
    conn.on('ready', function() {
        glob('**/*.*',{
            cwd: path.join(cwd, 'dist')
        }, function (err, files) {
            let length = files.length, index = 0
            conn.sftp((err, sftp) => {
                spinner.stop()
                const upload = () => {
                   const currentFile = files[index++]
                    if ( !currentFile || index > length ) {
                        console.log('上传完毕')
                        conn.end();
                        return;
                    }
                    sftp.fastPut(path.join(cwd,'dist', currentFile), path.join(remotePath, currentFile).replace(/\\/g, '/'), function(err, result){
                        if (err) {
                            console.log(err, '出错了')
                            return
                        }
                        console.log(`${currentFile}上传成功`)
                        upload()
                    });
                }
                upload()
            })
        })

    }).connect({
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password
    });
});