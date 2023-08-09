---
layout: post
title: "Python 3 学习记录：字符串"
summary: Python是一种跨平台的计算机程序设计语言，是一个高层次的结合了解释性、编译性、互动性和面向对象的脚本语言。在博客中，我将陆续记录我的Python学习过程，这是第一篇，Python 3 学习记录（一）：字符串。
date: "2020-04-12"
categories: "Tech"
---

Python是一种跨平台的计算机程序设计语言，是一个高层次的结合了解释性、编译性、互动性和面向对象的脚本语言。在博客中，我将陆续记录我的Python学习过程，这是第一篇，Python 3 学习记录（一）：字符串。

### 一、代码及呈现

**代码：**

```python
# 输出字符串
message = "Hello Python!"
print(message)

message2 = "Hello Python 2!"
print(message2)

# 字符串大小写修改
name = "chiloh wei"
print(name.title()) # 首字母大写
print(name.upper()) # 字母全部大写
print(name.lower()) # 字母全部小写

# 字符串合并（拼接）
firstname = "chiloh"
lastname = "wei"
fullname = firstname + " " + lastname
print(fullname)
print("Hello," + fullname.title() + "!")

# 制表符/换行符
print("chiloh wei")
print("\tchiloh wei") # 制表符： \t
print("hello,\nchiloh wei!") # 换行符： \n
print("Name:\n\tchiloh wei\n\tchiloh wei 2\n\tchiloh wei 3")

# 删除空白
text = " https://www.chiloh.cn/ "
website = text.rstrip() # 删除字符串后面空白
website2 = text.lstrip() # 删除字符串前面空白
website3 = text.strip() # 删除字符串两端空白
print(website)
print(website2)
print(website3)
```

**呈现：**

![Python字符串输出结果](https://chilohdata.s3.bitiful.net/blog/python200412.png "Python字符串输出结果")

### 二、课后练习题

**题目一：**

> 将用户的姓名存到一个变量中，并向该用户显示一条消息。显示的消息应非常简单，如：“Hello Eric, would you like to learn some Python today?”。

**代码实现：**

```python
name = "Eric"
message = "Hello " + name.title() + ", would you like to learn some Python today?"
print(message)
```

**题目二：**

> 将一个人名存储到一个变量中，再以小写、大写和首字母大写的方式显示这个人名。

**代码实现：**

```python
myname = "chiloh wei"
print(myname.lower()) # 人名小写
print(myname.upper()) # 人名大写
print(myname.title()) # 人名首字母大写
```

**题目三：**

> 找一句你钦佩的名人名言，将这个名人的姓名和他的名言打印出来。输出应类似于下面这样（包括引号）：`Albert Einstein once said, "A person who never made a mistake never tried anything new."`

**代码实现：**

```python
person = "Albert Einstein"
print(person.title() + 'once said, "A person who never made a mistake never tried anything new."')
```

**题目四：**

> 重复题目三，但将名人的姓名存储在变量`famous_person`中，再创建要显示的消息，并将其存储在变量`message`中，然后打印这条消息。

**代码实现：**

```python
famous_person = "Albert Einstein"
message = famous_person.title() + 'once said, "A person who never made a mistake never tried anything new."'
print(message)
```

**题目五：**

> 存储一个人名，并在其开头和末尾都包含一些空白字符，务必至少使用字符组合“\\t”和“\\n”各一次。打印这个人名，以显示其开头和末尾的空白。然后，分别使用剔除函数`lstrip()`、`rstrip()`和`strip()`对人名进行处理，并将结果打印出来。

**代码实现：**

```python
person_name = "\tHis Name:\n\t\tSteven Paul Jobs\n"
print(person_name)
print(person_name.lstrip()) # 剔除开头空白
print(person_name.rstrip()) # 剔除末尾空白
print(person_name.strip()) # 剔除两端空白
```
