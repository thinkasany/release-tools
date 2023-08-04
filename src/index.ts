const child_process = require("child_process");
const { NodeSSH } = require("node-ssh");
const path = require("path");
const fs = require("fs");
const dayjs = require("dayjs");


type Config = {
  host: string;
  username: string;
  password: string;
  port: number;
  remotePath: string;
  localFolder?: string;
};
type CommandsType = string[] | string;

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


async function uploadToServer(config: Config) {
  const server = {
    host: config.host,
    username: config.username,
    password: config.password,
    port: config.port
  };
  const localFolder = (config.localFolder = "dist"); // 默认dist，但是也可以自定义其他文件
  const remoteTargetPath = config.remotePath + "/" + localFolder;
  const localFolderPath = path.join(process.cwd(), "dist");
  // console.log(localFolderPath);

  const remotePath = config.remotePath;

  // 本地dist文件夹路径
  const localPath = path.join(process.cwd(), "dist");
  console.log(localPath);
  if (!fs.existsSync(localPath)) {
    console.error(`本地目录 ${localPath} 不存在，请在根目录执行`);
    process.exit(1);
  }

  const ssh = new NodeSSH();
  try {
    await ssh.connect(server);
    console.log("连接服务器成功, 当前时间：", `${dayjs().format("YYYY-MM-DD HH:mm:ss")}`);

       // 执行远程命令
    const { stdout } = await ssh.execCommand(`cd ${remotePath} && pwd`);
    console.log('当前工作目录:', stdout); // 输出当前工作目录

    // 执行移除远程服务器上的 dist 文件
    await ssh.execCommand(`rm -rf ${remoteTargetPath}`);

    await ssh.putDirectory(localFolderPath, remoteTargetPath, {
      recursive: true,
      concurrency: 10,
      validate: (itemPath: string) => {
        const baseName = path.basename(itemPath);
        return (
          baseName.substr(0, 1) !== "." &&
          baseName !== "node_modules" &&
          baseName !== ".git"
        );
      }
    });
    console.log("上传完成，当前时间：", `${dayjs().format("YYYY-MM-DD HH:mm:ss")}`);
  } catch (err: any) {
    console.error(`连接服务器失败：${err.message}`);
  } finally {
    ssh.dispose();
  }
}

async function uploadTools({
  commands,
  config
}: {
  commands: CommandsType;
  config: Config;
}) {
  execCommand(commands);
  await uploadToServer(config);
}

module.exports = uploadTools;
