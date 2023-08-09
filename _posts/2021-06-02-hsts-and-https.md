---
layout: post
title: "HSTS 与全站 HTTPS"
summary: 昨天博客的证书过期了，在更新证书的时候，顺便在[MySSL](https://myssl.com/)网站检测了下站点安全情况，因为没有开启HSTS的原因，只有A而没得A+，于是给博客加上了HSTS，并且顺便开启了全站HTTPS。
date: "2021-06-02"
categories: "Tech"
---

昨天博客的证书过期了，在更新证书的时候，顺便在[MySSL](https://myssl.com/)网站检测了下站点安全情况，因为没有开启HSTS的原因，只有A而没得A+，于是给博客加上了HSTS，并且顺便开启了全站HTTPS。

### Nginx启用HSTS

HSTS，HTTP严格传输安全协议（HTTP Strict Transport Security）的简称，是一套由互联网工程任务组发布的互联网安全策略机制。其作用主要在于：

- 强制客户端（如浏览器）使用HTTPS与服务器创建连接
- 保护网站，减少会话劫持风险

开启方法很简单，以lnmp部署的网站为例，先切换到nginx站点配置目录：

```
cd /usr/local/nginx/conf/
```

然后在nginx目录下找到站点的配置文件，打开`domain.com.conf`文件，在Sever 443下加入：

```
# HSTS
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

然后再去检测的时候，就会发现，评分变成A+了：

![HSTS](https://chilohdata.s3.bitiful.net/blog/hsts-ssl-a+.png "HSTS")

### 开启全站HTTPS

由于之前已经做了一部分的全站HTTPS工作，这次只是补充与完善，就简单说明下，详细的内容可以网上搜索一下。

1、登录Typecho后台 -> 设置 -> 基本设置 -> 站点地址，将其改成https的域名；  
2、编辑Typecho站点根目录下的config.inc.php文件，并加入下面一行配置：

```
/** 开启HTTPS */
define('__TYPECHO_SECURE__',true);
```

3、编辑主题文件夹下的comments.php文件，将$this->commentUrl()替换成：

```
echo str_replace("http","https",$this->commentUrl());
```

4、更新站点引用的附件地址为https，执行下方SQL数据库操作，其中domain.com为站点域名：

```
UPDATE `typecho_contents` SET `text` = REPLACE(`text`,'http://domain.com','https://domain.com');
```

5、通过WEB服务器（Ningx）将80端口（HTTP）重定向到443端口（HTTPS），强制全站HTTPS；

6、最后F12打开Chrome浏览器，就可以看到`This page is secure (valid HTTPS)`的提示了。

![HTTPS](https://chilohdata.s3.bitiful.net/blog/typecho-https.jpg "HTTPS")
