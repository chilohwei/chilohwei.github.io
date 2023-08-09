---
layout: post
title: "Hexo NexT 博客遇到的问题总结"
summary: 终于完成了 Hexo 博客的搭建、优化以及部署，虽然在过程中遇到了各种各样的问题，但最终都一定程度上解决了它。下面列举了一些相对困扰比较久的问题及解决办法，遇到的其他小问题不一一赘述。
date: "2019-06-20"
categories: "Tech"
---

终于完成了 Hexo 博客的搭建、优化以及部署，虽然在过程中遇到了各种各样的问题，但最终都一定程度上解决了它。下面列举了一些相对困扰比较久的问题及解决办法，遇到的其他小问题不一一赘述。

总结下来就是：① 善用搜索引擎（Baidu / Google） ② 研读官方文档 ③ 多思考多实操。

### 域名解析问题：

**问题（一）：域名解析到 Dnspod 后访问不到或跳转到域名商那里**

- 原因：博主在 Namesilo 购买的域名，域名管理默认自带了4个 DNS 解析记录。

解决办法：删除掉自带的 DNS 解析记录，在 Dnspod 处设置一或两个 A 记录（可以在`Github`查看或自行`ping username.github.io`）指向 IP，一个`CNAME`记录指向`username.github.io`域名。

### 访问速度问题：

**问题（一）：添加`Valine`后站点访问加载缓慢**

> 原因：`Valine` 评论系统默认的 CDN 地址 `unpkg.com/valine/dist/Valine.min.js` 加载太慢。
> 
> 解决办法：替换 `\themes\next\layout\_third-party\comments\valine.swig` 中的默认 CDN 地址为最新的 `Valine.min.js` 地址。  
> 最新 Valine.min.js 获取地址：[https://www.jsdelivr.com/package/npm/valine](https://www.jsdelivr.com/package/npm/valine)，获取方法如下图：

![](https://chilohdata.s3.bitiful.net/blog/valine-cdn-url.jpg "valine-cdn-url.jpg")

### SEO问题：

**问题（一）：站点无法通过百度站长平台验证**

> 原因：百度未找到验证文件或验证文件被 Hexo 模板渲染，内容已改变（博主遇到的就是这种情况，在 github 里查看文件内容被渲染修改）
> 
> 解决办法：使用文件验证，将指定 html 文件放至 source 目录下，并在站点配置文件中添加 `skip_render: baidu_verify_******.html`

**问题（二）：若文章名有中文，博客文章链接默认带有中文**

> 原因：站点配置文件中 Permalink 默认为：`posts:/:year/:month/:day/:title/`
> 
> 解决办法：使用`npm hexo-abbrlink --save`安装插件，按插件文档配置好站点文件，会利用算法将博客文章链接优化为不带中文的3层链接形式。

### 博客备份和恢复

#### 博客备份

```bash
$ git init //git初始化
$ git add . //git 文件添加
$ git commit -m "init" //git 提交
$ git pull origin hexo //pull到hexo分支
$ git push origin hexo //push到hexo分支
```

#### 博客恢复

```bash
（一）配置 ssh 连接 Github

$ cd ~/.ssh 或cd .ssh //检查本机是否有ssh key设置
$ cd ~  //若没有 ssh ，则切换当前路径在 ”~” 下
$ ssh-keygen -t rsa -C "user@example.com" //引号内为自己邮箱，三个回车后生成ssh key;添加id_rsa.pub内容到Github;
$ git config --global user.name “your_username”  //设置用户名
$ git config --global user.email “your_registered_github_Email”  //设置邮箱地址(建议用注册giuhub的邮箱)
$ ssh -T git@github.com //测试ssh key是否设置成功

（二）安装 Node.js；Git；Hexo；

$ git clone -b hexo git@github.com:user/user.github.io.git  //将Github中hexo分支clone到本地
$ cd user.github.io //切换到hexo目录下
$ npm install hexo
$ npm install 
$ npm install hexo *** //安装需要的插件：feed;deployer;abbrlink;sitemap;pdf;nofollow;baidu-url-submit等
$ hexo g -d //测试能否正常编译上传
```

### 博主安装的插件：

```bash
 hexo-abbrlink // Hexo 链接优化
 hexo-baidu-url-submit // 百度链接主动提交
 hexo-blog-encrypt // 博客文章加密
 hexo-autonofollow // 出站链接优化
 hexo-deployer-git // 上传部署
 hexo-generator-baidu-sitemap //百度站点地图
 hexo-generator-feed // RSS 插件
 hexo-generator-searchdb // 站内搜索
 hexo-generator-sitemap // 站点地图
 hexo-neat // 博客压缩
 hexo-pdf // 博客文章 PDF 显示
 hexo-wordcount // 计数插件
 hexo-lazyload-image //图片懒加载
```
