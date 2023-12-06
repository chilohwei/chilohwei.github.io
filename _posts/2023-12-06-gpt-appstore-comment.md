---
layout: post
title: "Python 抓取 App Store 应用评论 2"
summary: 19年还在做运营的时候，曾经用知乎上的代码抓取过 AppStore 的应用评论。时至如今，GPT出来后，从前的那支箭又射了回来，与之同来的是肉眼可见的成长。
date: "2023-10-28"
categories: "Share"
---

这是19年曾发布的一篇文章：[Python 抓取 App Store 应用评论](https://blog.chiloh.cn/python-comments.html)，当时完全不懂Python代码开发，却还是摸索着获取到了一些应用的评论。而最近，再次遇到了当年的需求，肉眼可见地能看到自己的成长。

录了一个视频，分享下自己的感受：

<video width="100%" height="auto" controls="">
  <source src="https://chilohdata.s3.bitiful.net/videos/app-comment.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


## 代码实现

代码已经开源：[chilohwei/app-comments](https://github.com/chilohwei/app-comments)，之后应该还会再优化完善。[访问Demo网址](https://apps.chiloh.cn)

**部署**
```yml
version: "3"
services:
  web:
    image: chiloh/apps-comments:latest
    ports:
      - "8000:8000"
```

新的时代已来到，尽情拥抱AI吧！！