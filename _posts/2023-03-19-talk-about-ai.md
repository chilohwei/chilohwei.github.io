---
layout: post
title: "浅聊人工智能"
summary: 自己在关注研究的领域有 2 个，一个是区块链，一个是人工智能。说实话，ChatGPT 的出现比预想中要快很多，也许以后某一天回想起来，今年真的是非常特别的一年。
date: "2023-03-19"
categories: "Thought"
---

自己在关注研究的领域有 2 个，一个是区块链，一个是人工智能。说实话，ChatGPT 的出现比预想中要快很多，也许以后某一天回想起来，今年真的是非常特别的一年。

### 一些流行的产物

- [ChatGPT](https://chat.openai.com)
- [Midjourney](https://www.midjourney.com)
- [Dall·E 2](https://openai.com/product/dall-e-2)
- [Stable Diffusion](https://github.com/CompVis/stable-diffusion)
- [LoRA](https://github.com/microsoft/LoRA)
- [ControlNet](https://github.com/lllyasviel/ControlNet)
- [Stanford\_Alpaca](https://github.com/tatsu-lab/stanford_alpaca)
- [Claude](https://www.anthropic.com/product)
- [PaLM](https://ai.googleblog.com/2023/03/palm-e-embodied-multimodal-language.html)

### 一些自己的体验

最近自己一直在使用 ChatGPT 的新模型，愈发觉得这会是一个划时代的产品。它使得个体不再强依赖于专业知识的桎梏，创造力得以进一步释放。

以我自己为例，最近在学习 Python 爬虫，想着爬一下自己博客的所有文章，最后输出一个表格。放在以前，我要去思考用什么样的方式来实现，以及自己去多测试一下。而现在，只需要将自己的需求以自然语言告诉 GPT，它会返回一个逻辑结构没有问题的代码，而我只需要做的是改一改其中的参数，更符合我的实际需求。

贴一下 GPT 4 帮我生成的 Python 爬虫代码， 我仅仅对其中的 find() 方法做了小的调整，改了 class 属性，这个效率是惊人的。

```python
import requests
from bs4 import BeautifulSoup
import pandas as pd

# 定义目标网址
base_url = 'http://blog.chiloh.cn'
page_url = '/page/'

# 发起请求并获取总页数
response = requests.get(base_url)
soup = BeautifulSoup(response.text, 'html.parser')
last_page = int(soup.find('ol', class_='page-navigator').find_all('a')[-2].text.strip())

# 创建一个空的列表，用于存储每篇文章的标题、链接和发布时间
data = []

# 遍历所有分页页面
for i in range(1, last_page + 1):
    url = base_url + page_url + str(i)
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # 找到所有文章的标题、链接和发布时间
    articles = soup.find_all('article', class_='post')

    # 遍历所有文章，提取标题、链接和发布时间，并添加到data列表中
    for article in articles:
        title = article.find('h2', class_='post-title').text.strip()
        link = article.find('a', href=True)['href']
        date = article.find('date', class_='post-meta').text.strip()
        data.append([title, link, date])

# 将data列表转换为pandas的DataFrame格式
df = pd.DataFrame(data, columns=['标题', '链接', '发布时间'])

# 将DataFrame保存为名为typecho的表格文件
df.to_csv('typecho.csv', index=False)
```

### 一些自己的感受

在公司日报里，自己写了下面的感受分享。其实还有一些与产品相关的设想，由于比较敏感就删除掉了。大体的意思是 ok 的，这是近半年来自己的一些体验与想法。

> AI 比预想中要来得更快一些，回过头来看，许多之前涌现的产品更像是水暖之前的鸭子。AI 像是人类智慧的孩子，无限逼近我们说的本体，但它又不是本体，它可以是 Everything。
> 
> 对它的认识，与之前体验许多产品后，结合自己的思考，在产品上想实现的探索是吻合的：
> 
> **信息传递障碍减弱**
> 
> 人类对话式的 prompt 交互方式，极大程度降低了输入与输出的难度，个体不再受限于专业知识的桎梏，创造力得以进一步释放。狭义上的超级个体一定会越来越多涌现，表达的空间是一个肉眼可见的增长区间。
> 
> **信息流通速度加快**
> 
> 多模态的 model 让信息形态不再那么重要，就像很久之前设想的那样：信息可以是固态，液态，甚至是气态。而现在信息可以是文字，是图片，是音频，是视频。
> 
> 这意味着，**也许会出现一种 Flow 的新事物，它会在不同的应用，不同的角色之间流转，在一款应用里是文字，在另一款应用里也许是视频，但它们本质要传递的是同一份序列信息。**
> 
> 而跨模态的信息，在流通时将会是一个天然的 Flow，它可以流动到任何形状里，变成想要的模样。
> 
> **信息质量损耗与还原**
> 
> 信息形态的变换，在不同时空下，注定会有一些损耗。 从视频变成文字，会损失图像，就像我们开会要看到摄像头一样，这部分就是损失的信息。**而逆向思考，我们在做的是尽可能去还原信息的本体。**
> 
> 就像线上开会一样，损失了线下大家互相看见的部分，所以有许多会议软件会做摄像头，会做增强眼神对话，会做降噪处理，本质上都是在还原时空下的信息全貌。
> 
> 在不同的时空下，不同信息的损耗是不同的，这意味着各种各样的信息供给。需要以一种自由的方式去自定义如何提供给下一个时空场景。不同的场景和角色对于信息的需求是不同的，在还原信息全貌的过程中，更像是从这些供给当中选择更加重要的部分，去尽力在这个“场”下来还原。
> 
> 将信息在不同时空的流通看作是一种“死亡”，AGI的生成能力在做的是“创造与新生”。某些信息在上一个时空里死了，但下一个时空里会新生一些出来
