---
layout: post
title: "Python 抓取 App Store 应用评论"
summary: 由于项目组最近在做ASO优化，需要我和另一位运营同事搜集大量应用评论。常规方法是借助第三方ASO优化平台的评论导出功能，不过此功能可导出的数据不多。网上搜索后学习到了Python抓取App Store任意应用评论的方法。
date: "2019-07-13"
categories: "Tech"
---

由于项目组最近在做ASO优化，需要我和另一位运营同事搜集大量应用评论。常规方法是借助第三方ASO优化平台的评论导出功能，不过此功能可导出的数据不多。网上搜索后学习到了Python抓取App Store任意应用评论的方法。

### 常规应用评论获取方法

以[七麦数据ASO平台](https://www.qimai.cn/)为例，搜索想要获取的APP应用，比如微信，然后在微信的七麦详情页选择「评分评论」，最后查看「评论详情」并点击「导出数据」按钮，就可以导出应用评论数据。

![七麦应用数据.png](https://chilohdata.s3.bitiful.net/blog/qmaso.png "七麦应用数据.png")

该方法的优缺点如下：

- **优点：**可以按日期、星级、关键词筛选评论，且相对更符合机刷要求；
- **缺点：** 无法直接导出评论数据，需要人工对评论数据进行文本处理；

### Python获取App Store任意应用评论

在排除上述常规方法后，便考虑有无方法可以直接抓取到App Store 下竞品的评论数据，一番搜索后，发现知乎上有一段Python脚本可以利用苹果官方API抓取500条评论数据。

原帖地址：[如何获取itunes一款app的所有评论内容？爬虫？苹果提供的api?](https://www.zhihu.com/question/23945309/answer/141943202)

按照此方法进行了尝试，成功抓取到App Store下任意ID产品的评论数据并以excel表格形式导出。使用方法如下：

**第一步：** 安装Python 3环境，可通过下载安装 [Anaconda（清华大学源）](https://mirror.tuna.tsinghua.edu.cn/help/anaconda/)实现。

**第二步：** 利用`pip`命令安装`XlsxWriter`模块，代码如下：

```bash
pip install XlsxWriter
```

**第三步：** 百度搜索：appstore + app 名，从官网进入，查看地址栏获取应用ID。

**第四步：** 保存下面Python脚本为`*.py`格式，例如`comments.py`。

```python
import urllib.request
import json
import xlsxwriter
print("这是一个在线获取appstore里任意app的评论列表工具")
print("运行完毕后 将生成一个名为“app评论.xlsx”的文件")
page=1;
appid=input("请输入应用id号:");
#appid=1182886088
workbook = xlsxwriter.Workbook('app评论.xlsx')
worksheet = workbook.add_worksheet()
format=workbook.add_format()
format.set_border(1)
format.set_border(1)
format_title = workbook.add_format()    
format_title.set_border(1)   
format_title.set_bg_color('#cccccc')
format_title.set_align('left')
format_title.set_bold()    
title=['昵称','标题','评论内容']
worksheet.write_row('A1',title,format_title)
row=1
col=0
count=0

#默认循环10次  
while page<11:
    myurl="https://itunes.apple.com/rss/customerreviews/page="+str(page)+"/id="+str(appid)+"/sortby=mostrecent/json?l=en&&cc=cn"
    response = urllib.request.urlopen(myurl)
    myjson = json.loads(response.read().decode())
    print("正在生成数据文件，请稍后......"+str(page*10)+"%")
    if "entry" in myjson["feed"]:
        count+=len(myjson["feed"]["entry"])
        #循环写入第1列：昵称
        for i in myjson["feed"]["entry"]:
            worksheet.write(row,col,i["author"]["name"]["label"],format)
            row+=1
        #循环写入第2列：标题    
        row=1+(page-1)*50
        for i in myjson["feed"]["entry"]:
            worksheet.write(row,col+1,i["title"]["label"],format)
            row+=1
        #循环写入第3列：内容
        row=1+(page-1)*50
        for i in myjson["feed"]["entry"]:
            worksheet.write(row,col+2,i["content"]["label"],format)
            row+=1
        page=page+1
        row=(page-1)*50+1
    else:
        print("正在生成数据文件，请稍后......100%")
        break
if count==0:
    print("运行完毕，未获取到任何数据。请检查是否输入正确！")
else:
    print("生成完毕，请查阅相关文件,共获取到"+str(count)+"条数据")
workbook.close()
```

**第五步：**如想在`e:\`盘根目录保存最后生成的应用评论表格，便可以在该目录下的DOS窗口下运行此脚本。

```bash
cd e:\
python comments.py
```

然后按照提示输入应用ID就可以自动抓取该ID对应的应用在App Store里的评论，如下图。

![python获取评论.png](https://chilohdata.s3.bitiful.net/blog/python-comments.png "python获取评论.png")

### 参考资料

- [如何获取itunes一款app的所有评论内容？爬虫？苹果提供的api?](https://www.zhihu.com/question/23945309/answer/141943202)
