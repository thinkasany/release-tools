# 介绍

做一个自动上传服务器的脚本工具, 通过解析本地密钥来实现 🔧

[upload-tools](https://www.npmjs.com/package/upload-tools) 🔗

[blog: 介绍了代码和发布流程](https://blog.csdn.net/daddykei/article/details/129497959?spm=1001.2014.3001.5502)

[仓库地址](https://github.com/thinkasany/release-tools)

[npm 地址](https://www.npmjs.com/package/think-release-tools)

Config 服务器的配置

```
interface ConfigProps {
    host: string;
    port: number;
    username: string;
    privateKeyPath: string;
    remoteFolderPath: string;
    localFolder: string;
    passphrase: null | string;
}
```

# 示例代码

```
const config = {
    host: "10.0.0.1", // 服务器IP
    port: 22, // 默认 22
    username: "root", // 默认 root
    privateKeyPath: "/Users/thinkerwing/.ssh/id_rsa", // 本地私钥文件路径
    remoteFolderPath: "../usr/yupoo/app/thinkasany", // 远程目录地址
    localFolder: "dist", // 默认dist，但是也可以自定义其他文件
    passphrase: null, // 如果私钥有密码，提供密码，否则省略
}

const commands = ['yarn lint:prettier', 'yarn build'];

uploadTools({ commands, config });

```



# 实现效果

```
$ node ./bin/release.js
SSH connection established... (SSH 连接已建立) 2023-07-26 16:38:20
Uploaded local dist directory to remote server... (本地目录 dist 已上传至服务器) 2023-07-26 16:38:22
✨  Done in 1.79s.
```

# 使用指南 🧭

```
npm i think-release-tools -D
```

按照示例代码填写配置项

通过 node test.js 或者 在 packeage.json 中配置

```
 "scripts": {
    "release": "node ./bin/release.js ",
  }
```

通过 `yarn release` 实现
