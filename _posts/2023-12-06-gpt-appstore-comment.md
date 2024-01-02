---
layout: post
title: "工作成长"
summary: 19年还在做运营的时候，曾经用知乎上的代码抓取过 AppStore 的应用评论。时至如今，GPT出来后，从前的那支箭又射了回来，与之同来的是肉眼可见的成长。
date: "2023-10-28"
categories: "Tech"
---

这是19年曾发布的一篇文章：[Python 抓取 App Store 应用评论](https://blog.chiloh.cn/python-comments.html)，当时完全不懂Python代码开发，却还是摸索着获取到了一些应用的评论。而最近，再次遇到了当年的需求，肉眼可见地能看到自己的成长。

录了一个视频，分享下自己的感受：

<video width="100%" height="auto" controls="">
  <source src="https://chilohdata.s3.bitiful.net/blog/app-comment.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>


## 代码实现

代码已经开源：[chilohwei/app-comments](https://github.com/chilohwei/app-comments)，之后应该还会再优化完善。[访问Demo网址](https://apps.chiloh.cn)

核心是以下这2个文件：

**app.py**
```python
from flask import Flask, render_template, request, send_file
import pandas as pd
from snownlp import SnowNLP
import urllib.request
import json
import io

app = Flask(__name__)

# 获取评论的函数
def get_reviews(appid, page, country):
    url = "https://itunes.apple.com/rss/customerreviews/page={}/id={}/sortby=mostrecent/json?l=en&cc={}".format(page, appid, country)
    response = urllib.request.urlopen(url)
    data = json.loads(response.read().decode())
    if "entry" in data["feed"]:
        return data["feed"]["entry"]
    else:
        return []

# 情感分析的函数
def sentiment_analysis(text):
    sentiment = SnowNLP(text).sentiments
    if sentiment > 0.6:
        return "好评"
    elif sentiment < 0.4:
        return "差评"
    else:
        return "中性"

# 主页面路由
@app.route('/')
def index():
    return render_template('index.html')

# 获取评论并下载为Excel的路由
@app.route('/fetch_reviews', methods=['POST'])
def fetch_reviews():
    appid = request.form['appid']
    country = request.form['country']
    start_page = int(request.form['start_page'])
    end_page = int(request.form['end_page'])
    
    result = []
    for page in range(start_page, end_page + 1):
        reviews = get_reviews(appid, page, country)
        for review in reviews:
            if isinstance(review, dict):
                date = review["updated"]["label"]
                content = review['content']['label']
                rating = review['im:rating']['label']
                version = review['im:version']['label']
                author = review['author']['name']['label']
                sentiment = sentiment_analysis(content)
                result.append({
                    'updated': date,
                    'content': content,
                    'rating': rating,
                    'version': version,
                    'author': author,
                    'sentiment': sentiment
                })
    
    # 将评论数据保存为Excel文件
    df = pd.DataFrame(result)
    excel_io = io.BytesIO()
    with pd.ExcelWriter(excel_io, engine='xlsxwriter') as writer:
        df.to_excel(writer, sheet_name='Comments', index=False)
    excel_io.seek(0)
    
    # 设置响应信息并发送文件
    return send_file(
        excel_io,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='comments.xlsx'
    )

# 启动Flask应用
# 启动Flask应用
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=False, port=8000) 
```

**templates/index.html**

```html
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="shortcut icon" href="https://chilohdata.s3.bitiful.net/avatar.png">
<title>AppStore应用评论获取</title>
<style>
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 0;
        background: #f7f7f7;
    }
    .container {
        max-width: 600px;
        margin: 50px auto;
        background: #fff;
        padding: 20px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    h1 {
        text-align: center;
        color: #333;
    }
    .form-group {
        margin-bottom: 15px;
    }
    label {
        display: block;
        margin-bottom: 5px;
    }
    select, input[type="number"], button {
        width: 100%;
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        box-sizing: border-box; /* Prevents padding from expanding the width */
    }
    button {
        background: #5cb85c;
        color: white;
        border: none;
        cursor: pointer;
    }
    button:hover {
        background: #4cae4c;
    }
</style>
</head>
<body>
    <div class="container">
        <h1>AppStore应用评论获取</h1>
        <form method="post" action="/fetch_reviews">
            <div class="form-group">
                <label for="appid">应用ID:</label>
                <input type="text" id="appid" name="appid" required>
            </div>
            <div class="form-group">
                <label for="country">选择国家:</label>
                <select name="country" id="country">
                    <option value="us">美国</option>
                    <option value="cn">中国</option>
                    <!-- 可以根据需要添加更多国家选项 -->
                </select>
            </div>
            <div class="form-group">
                <label for="start_page">开始页码:</label>
                <input type="number" id="start_page" name="start_page" min="1" required>
            </div>
            <div class="form-group">
                <label for="end_page">结束页码:</label>
                <input type="number" id="end_page" name="end_page" min="1" required>
            </div>
            <button type="submit">获取评论</button>
        </form>
    </div>
</body>
</html>
```


## 网站部署
```yml
version: "3"
services:
  web:
    image: chiloh/apps-comments:latest
    ports:
      - "8000:8000"
```

新的时代已来到，**尽情拥抱AI吧！！**