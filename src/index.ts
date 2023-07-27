const { NodeSSH } = require("node-ssh");
const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");
const inquirer = require('inquirer');

interface ConfigProps {
  host: string;
  port: number;
  username: string;
  privateKeyPath: string;
  remoteFolderPath: string;
  localFolder: string;
  passphrase: null | string;
}

type CommandsType = string[] | string;

function isMissingParameter(obj: any) {
  for (const key in obj) {
    if (obj[key] === undefined) {
      return true;
    }
  }
  return false;
}


function execCommand(commands: CommandsType) {
  (Array.isArray(commands) ? commands : [commands]).forEach((c) => {
    try {
      console.log(`start: ${c}...`);
      console.log(child_process.execSync(c).toString("utf8"));
    } catch (error: any) {
      console.log("\x1B[31m%s\x1B[0m", error.stdout.toString());
      process.exit(1);
    }
  });
}


async function uploadToServer(configuration: ConfigProps, choices?: string[]) {
  let privateKeyPathChoice = null; // 如果配置了就选择终端输入的，没有的话就选择config中的默认配置

  // console.log('start --', choices);
  if (choices?.length) {
    await inquirer
      .prompt([
        {
          type: 'list',
          name: 'selectedOption',
          message: '请选择一个密钥地址:',
          choices: choices,
        },
      ])
      .then((answers: { selectedOption: any; }) => {
        // 获取用户选择的选项，并将结果赋值给 res 变量
        privateKeyPathChoice = answers.selectedOption;
        console.log('你选择的密钥地址是:', privateKeyPathChoice);
        uploadFunc(configuration, privateKeyPathChoice)
      })
      .catch((error: any) => {
        console.error('选择过程出现错误:', error);
      });
    return;
  }

  uploadFunc(configuration);
}

const uploadFunc = async (configuration: ConfigProps, privateKeyPathChoice?: string) => {
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
    privateKey: fs.readFileSync(privateKeyPathChoice ?? configuration.privateKeyPath).toString("utf-8"), // 读取私钥文件
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

 * @param {CommandsType} commands - 上传前需要执行的命令，比如 ['npm run build'] 之类的...
 * @param {ConfigProps} config - 服务器配置
 * @param {ConfigProps} choices - 可选，如果用户比较多的话，可以通过数组来存放，通过终端交互选择校验的密钥地址
 * 
 * 
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
async function uploadTools({
  commands,
  config,
  choices
}: {
  commands: CommandsType;
  config: ConfigProps;
  choices?: string[]
}) {
  execCommand(commands);
  await uploadToServer(config, choices);
}
module.exports = uploadTools;