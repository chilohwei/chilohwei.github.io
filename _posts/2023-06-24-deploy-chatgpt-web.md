---
layout: post
title: "部署 ChatGPT 网站"
summary: 跟着教程部署自己的 ChatGPT 网站，话不多说，直接上干货：
date: "2023-06-24"
categories: "Tech"
---

跟着教程部署自己的 ChatGPT 网站，话不多说，直接上干货：

## 一、Vercel 部署

> 以下方案默认您可以连接 Github 和 Vercel，如您无法正常访问上面网站，可能无法按教程部署。

这个方案适用于没有自己服务器的小伙伴，可以直接借助 Vercel，采用下面的开源方案来一键部署：

[GitHub - ourongxing/chatgpt-vercel: Elegant and Powerfull. Powered by OpenAI and Vercel.](https://github.com/ourongxing/chatgpt-vercel)

方法也非常简单：打开上面的网站，点击 `Deploy` 按钮，最后填入自己的 OpenAI API 信息来配置环境变量。

**视频教程**

<div style="width:100%;height:0;padding-bottom:56%;position:relative;">
<video width="100%" height="100%" style="position:absolute" controls>
  <source src="https://chilohdata.s3.bitiful.net/blog/chatgpt-vercel.mp4" type="video/mp4">
</video>
</div>

## 二、Docker 部署

> 以下方案默认您可以连接 Github，并且知道如何使用最基本的 Linux 操作指令。如您不清楚，可以网上搜索学习或者咨询作者：
> 
> - Email：[me@chiloh.com](mailto:me@chiloh.com)

这个方案适用于有自己服务器的小伙伴，可以直接借助 Docker 和 Nginx Proxy Manager，采用下面的开源方案来部署：

[GitHub - Kerwin1202/chatgpt-web: 用 Express 和 Vue3 搭建的 ChatGPT 演示网页](https://github.com/Kerwin1202/chatgpt-web)

**2.1 安装 Docker 环境**

安装 Docker：

```bash
wget -qO- get.docker.com | bash

docker -v  #查看 docker 脚本

systemctl enable docker  # 设置开机自动启动
```

安装 Docker-compose：

```bash
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker-compose --version  #查看 docker-compose 版本
```

**2.2 安装 Nginx Proxy Manager 反向代理**

创建安装目录：

```bash
sudo -i

mkdir -p /root/data/docker_data/npm

cd /root/data/docker_data/npm
```

新建 docker-compose.yml 文件：

```bash
vim docker-compose.yml
```

复制并粘贴下方的内容，然后 `:wq` 保存：

```yml
version: '3'
services:
  app:
    image: 'jc21/nginx-proxy-manager:latest'
    restart: unless-stopped
    ports:
      - '80:80'  #冒号左边可以改成自己服务器未被占用的端口
      - '81:81'  #冒号左边可以改成自己服务器未被占用的端口
      - '443:443' #冒号左边可以改成自己服务器未被占用的端口
    volumes:
      - ./data:/data #冒号左边可以改路径，现在是表示把数据存放在在当前文件夹下的 data 文件夹中
      - ./letsencrypt:/etc/letsencrypt  #冒号左边可以改路径，现在是表示把数据存放在在当前文件夹下的 letsencrypt 文件夹中
```

在服务器防火墙里放行上述端口，运行并访问 Nginx Proxy Manager：

```bash
docker-compose up -d 
```

默认的登录名和密码分别是：

```txt
Email:    admin@example.com
Password: changeme
```

**2.3 安装 ChatGPT 开源程序**

创建安装目录：

```bash
sudo -i

mkdir -p /root/data/docker_data/chatgpt-web

cd /root/data/docker_data/chatgpt-web
```

新建 docker-compose.yml 文件：

```bash
vim docker-compose.yml
```

复制并粘贴下方的内容，然后 `:wq` 保存：

```yml
version: '3'

services:
  app:
    image: kerwin1202/chatgpt-web:latest #总是使用latest,更新时重新pull该tag镜像即可
    container_name: chatgpt-web
    restart: unless-stopped
    ports:
      - 3002:3002 #冒号左边可以改成自己服务器未被占用的端口
    depends_on:
      - database
    environment:
      TZ: Asia/Shanghai
      # OpenAI API
      OPENAI_API_KEY: sk-xxx
      # 超时，单位毫秒，可选
      TIMEOUT_MS: 600000
      # 访问jwt加密参数，建议设置一个
      AUTH_SECRET_KEY: xxx
      # 网站名称（可自定义）
      SITE_TITLE: ChatGPT Web
      # mongodb 的连接字符串，与最底下 database 里的 username 和 password 保持一致
      MONGODB_URL: 'mongodb://username:password@database:27017'
      # 网站是否开启注册
      REGISTER_ENABLED: 'true'
      # 开启注册之后 网站注册允许的邮箱后缀 如果空 则允许任意后缀
      REGISTER_MAILS: '@qq.com,@sina.com,@163.com'
      # 开启注册之后 密码加密的盐 算法： echo -n 'passwordsalt' | md5sum | cut -c 1-32
      PASSWORD_MD5_SALT: xxx
      # 开启注册之后 超级管理邮箱
      ROOT_USER: me@example.com
      # 开启注册之后 网站域名 不含 / 注册的时候发送验证邮箱使用
      SITE_DOMAIN: http://127.0.0.1:3002
      # 开启注册之后 发送验证邮箱配置
      SMTP_HOST: smtp.exmail.qq.com
      SMTP_PORT: 465
      SMTP_TSL: 'true'
      SMTP_USERNAME: noreply@example.com
      SMTP_PASSWORD: xxx
      # 是否开启敏感词审核, 因为响应结果是流式 所以暂时没审核
      AUDIT_ENABLED: 'false'
      # https://ai.baidu.com/ai-doc/ANTIPORN/Vk3h6xaga
      AUDIT_PROVIDER: baidu
      AUDIT_API_KEY: xxx
      AUDIT_API_SECRET: xxx
      AUDIT_TEXT_LABEL: xxx
    links:
      - database

  database:
    image: mongo
    container_name: chatgptweb-database
    restart: unless-stopped
    ports:
      - '27017:27017'
    expose:
      - '27017'
    volumes:
      - mongodb:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: chatgpt
      MONGO_INITDB_ROOT_PASSWORD: xxxx
      MONGO_INITDB_DATABASE: chatgpt

volumes:
  mongodb: {}
```

在防火墙里放行上述端口，然后运行并访问：

```bash
docker-compose up -d
```

**2.4 配置反向代理**

访问 `http://ip:81` 进入 Nginx Proxy Manager 管理后台，点击 `Add Proxy Host`，然后按照下图指示来填写：

![NPM Host](https://chilohdata.s3.bitiful.net/blog/npm-host.png "NPM Host")

其中 IP 部分，可以在服务器上运行下面命令找到：

```bash
ip addr show docker0
```

Port 填写 `docker-compose.yml` 中定义好的端口，默认是 3002。

然后参考下图指示申请 SSL 证书，最后点击保存即可。（注意：这一块儿要申请后，再进来点一次）

![NPM SSL](https://chilohdata.s3.bitiful.net/blog/npm-ssl.png "NPM SSL")

最后，就可以使用你自己的域名访问网站了。部署后的效果如图：

![ChatGPT Web](https://chilohdata.s3.bitiful.net/blog/chatweb.png "ChatGPT Web")
