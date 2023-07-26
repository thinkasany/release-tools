const { NodeSSH } = require("node-ssh");
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");

interface ConfigProps {
  host: string;
  port: number;
  username: string;
  privateKeyPath: string;
  remoteFolderPath: string;
  localFolder: string;
  passphrase: null | string;
}
function isMissingParameter(obj: any) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      return true;
    }
  }
  return false;
}

async function uploadTools(configuration: ConfigProps) {
  if (isMissingParameter(configuration) || (!configuration.host || !configuration.port || !configuration.username || !configuration.privateKeyPath || !configuration.remoteFolderPath || !configuration.localFolder)) {
    console.log('\x1b[31m%s\x1b[0m', '请检查参数是否有漏或者错误，参考链接 https://github.com/thinkasany/release-tools');
    return
  }
  const ssh = new NodeSSH();
  const localFolder = (configuration.localFolder = "dist"); // 默认dist，但是也可以自定义其他文件
  const remoteTargetPath = configuration.remoteFolderPath + "/" + localFolder;
  const localFolderPath = path.join(process.cwd(), "dist");
  // console.log(localFolderPath);

  const config = {
    host: configuration.host,
    port: configuration.port,
    username: (configuration.username = "root"),
    privateKey: fs.readFileSync(configuration.privateKeyPath).toString("utf-8"), // 读取私钥文件
    passphrase: configuration?.passphrase, // 如果私钥有密码，提供密码，否则省略
  };

  // console.log(config);

  try {
    // 连接到远程服务器
    await ssh.connect({
      host: config.host,
      port: config.port, // 远程服务器的端口 默认为 22
      username: config.username, // SSH 登录的用户名
      privateKey: config.privateKey, // 本地私钥文件路径
      passphrase: config.passphrase, // 如果私钥有密码保护，请提供密码，否则省略
    });

    console.log(
      `SSH connection established... (SSH 连接已建立) ${dayjs().format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );

    // 在此可以执行其他操作，例如执行远程命令等
    // 使用 putDirectory 方法上传本地的 dist 文件夹


    // 执行移除远程服务器上的 dist 文件
    await ssh.execCommand(`rm -rf ${remoteTargetPath}`);

    await ssh.putDirectory(localFolderPath, remoteTargetPath, {
      recursive: true,
      concurrency: 10,
    });

    console.log('\x1b[32m%s\x1b[0m',
      `Uploaded local ${localFolder} directory to remote server... (本地目录 ${localFolder} 已上传至服务器) ${dayjs().format(
        "YYYY-MM-DD HH:mm:ss"
      )}`
    );

    // 关闭SSH连接
    ssh.dispose();
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

/**
  const config = {
    host: "10.0.0.1", // 服务器IP
    port: 22, // 默认 22
    username: "root", // 默认 root
    privateKeyPath: "/Users/thinkerwing/.ssh/id_rsa", // 本地私钥文件路径
    remoteFolderPath: "../usr/yupoo/app/thinkasany", // 远程目录地址
    localFolder: "dist", // 默认dist，但是也可以自定义其他文件
    passphrase: null, // 如果私钥有密码，提供密码，否则省略
  };
  uploadTools(config)
 */

module.exports = uploadTools;