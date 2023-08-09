---
layout: post
title: "Hexo 博客发表时间随更新变为更新时间的问题"
summary: 近期，在更新完文章利用 Travis CI 自动部署后，偶然发现文章的发表时间随着更新变为更新时间。对于这个问题，思考后暂时考虑问题出在 Travis CI 自动部署上，因为每次自动部署后时间都与部署时刻时间一致。
date: "2017-11-05"
categories: "Tech"
---

近期，在更新完文章利用 Travis CI 自动部署后，偶然发现文章的发表时间随着更新变为更新时间。对于这个问题，思考后暂时考虑问题出在 Travis CI 自动部署上，因为每次自动部署后时间都与部署时刻时间一致。

### 猜想验证

#### 步骤（一）使用传统 hexo g 和 hexo d方法部署

部署完成后发现文章发表时间与更新时间出现了变化，发表时间为 Tracis CI 自动部署建立好后的时间，而更新时间则为此次作变化后传统部署后的时间，因此确定问题出现在 Travis CI 自动部署上。

#### 步骤（二）检查Travis CI自动部署文件

打开 Travis CI 自动部署文件 `.travis.yml` 查看：

```
language: node_js
node_js: stable

cache:
  directories:
    - node_modules

before_install:
  - export TZ='Asia/Shanghai' # 更改时区
  - npm install hexo-cli -g

install:
  - npm install
  - npm install hexo-deployer-git --save

script:
  - hexo clean
  - hexo generate

after_script:
  - cd ./public
  - git init
  - git config user.name "chiloh-wei"
  - git config user.email "chilohwei@gmail.com"
  - git add .
  - git commit -m "Travis CI Auto Updated"
  - git push --force --quiet "https://${GH_TOKEN}@${GH_REF}" master:master

branches:
  only:
    - hexo
env:
 global:
   - GH_REF: github.com/chilohwei/chilohwei.github.io.git
```

发现其执行完 hexo generate 后不是直接执行 hexo deploy ，而是切换到 hexo 分支 public 目录下将更新的文件强制提交到 master 分支，故可能无法区分发表时间和更新时间。

#### 步骤（三）解决方法

（1）在 `.travis.yml` 文件中加入 hexo deploy 以便自动部署时可以执行此命令，但添加 hexo deploy 后存在问题，access 接入报错，且有 token 私钥泄漏风险。处理比较麻烦，故未采用此解决方法。  
（2）更新文章时在 `front-matter` 中加入 `date` 来固定文章建立日期。  
（3）取消 Travis CI 自动部署，采用 `hexo g`、`hexo d` 传统方法上传部署。

### 总结

使用 Travis CI 自动部署 hexo 博客虽然在一定程度上简化了上传部署的步骤，但在 hexo 博客这块仅仅是取代了传统上传部署的 `hexo clean、hexo g、hexo d` 等命令，作用有限。也可能是因为对 Travis CI 自动部署认知不够，使用稍有障碍，因此考虑决定回用原传统上传部署手段。
