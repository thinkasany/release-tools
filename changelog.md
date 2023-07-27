# 1.0.6
```
处理依赖，兼容老款vue2的项目 node -v v12.22.12
```

# 1.0.7
新增参数 choices，供多人使用的时候可以选择不同的私钥地址
```
const choices = ['/Users/thinkerwing/.ssh/id_rsa1', '/Users/thinkerwing/.ssh/id_rsa', '/Users/thinkerwing/.ssh/id_rsa2']

uploadTools({ commands, config, choices })
```