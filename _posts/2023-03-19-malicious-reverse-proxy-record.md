---
layout: post
title: "记博客被恶意反代"
summary: 在技术上半吊子水平的我，第一次遇到博客被恶意解析与反代的事情，记录一下发现的经过与处理方法。
date: "2023-03-19"
categories: "Tech"
---

在技术上半吊子水平的我，第一次遇到博客被恶意解析与反代的事情，记录一下发现的经过与处理方法。

## 发现被恶意反代

其实之前在 Google 上搜索的时候，有看到 01868.com 这个网站上竟然有我在博客上发布的一些内容。刚开始没有很在意，怀疑可能是搬运。然后在最近借助 GPT4 学习 Python 爬虫的时候，意外发现抓取自己网站的时候，链接竟然除了主域，其他一模一样。

![20230319122747-2023-03-19](https://chilohdata.s3.bitiful.net/blog/20230319122747-2023-03-19.png "20230319122747-2023-03-19")

于是向 GPT4 咨询了建议，给的回复如下：

![20230319122917-2023-03-19](https://chilohdata.s3.bitiful.net/blog/20230319122917-2023-03-19.png "20230319122917-2023-03-19")

大致有了策略与方向。

## 开始处理这个问题

首先，日志排查了下自己的服务器上是否有恶意代码或者入侵的记录，没有发现。因此基本确定就是对方将自己的域名解析到了我的服务器IP上。最终的处理方案如下：

```bash
## Only allow GET and HEAD request methods
if ($request_method !~ ^(GET|HEAD)$ ) {
    return 444;
}
        
 # Deny illegal Host headers
if ($host !~ ^(chiloh\.cn|www\.chiloh\.cn)$ ) {
     return 444;
}
```

1. 在 Nginx 配置文件中添加以上代码：
2. 使用 lnmp restart nginx 来重新启动 Nginx 服务。
3. 在 /home/wwwroot 目录下，使用下方命令将常见的 phpmyadmin 和 index.html 重命名

```bash
mv phpmyadmin [新数据库后台名称]
mv index.html [新的主页文件名称]
```
4. 最后再次访问 01868 这个恶意域名，发现已经打不开我服务器下的任何文件了。

![20230319124420-2023-03-19](https://chilohdata.s3.bitiful.net/blog/20230319124420-2023-03-19.png "20230319124420-2023-03-19")

5. 以防万一，其实自己还准备了其他的安全手段。最差的选择就是迁移服务到一台新的服务器上了，不使用 lnmp 来部署，改用自己最近学习到的 docker 来部署。

## 一些题外话

服务器安全自己其实一直挺重视的，常规的端口更改与放行，包括禁止 root 登录，设置一个新用户等等操作每次都会做。这里也推荐一个脚本：[xiaoyunjie/Shell\_Script](https://github.com/xiaoyunjie/Shell_Script) ，使用起来挺方便的。
