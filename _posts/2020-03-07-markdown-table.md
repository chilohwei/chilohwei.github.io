---
layout: post
title: "博客中的 Markdown 表格写法"
summary: Markdown 是一种使用简单的标记语法从而使普通文本内容具备一定格式的标记语言。从认识它以后，发现许多地方都用得到，比如当前这篇文章就是使用 Markdown 写的。它语法极其简单，学起来也很快，唯有表格的写法上稍难一些，于是特地写了这篇文章记录。
date: "2020-03-07"
categories: "Tech"
---

Markdown 是一种使用简单的标记语法从而使普通文本内容具备一定格式的标记语言。从认识它以后，发现许多地方都用得到，比如当前这篇文章就是使用 Markdown 写的。它语法极其简单，学起来也很快，唯有表格的写法上稍难一些，于是特地写了这篇文章记录。

### Markdown 概述：

> 参考文章：[Markdown 中文文档](https://markdown-zh.readthedocs.io/en/latest/overview/)

#### 设计理念：

> Markdown 致力于使阅读和创作文档变得容易.  
> Markdown 视可读性为最高准则. Markdown 文件应该以纯文本形式原样发布, 不应该包含标记标签和格式化指令. 尽管 Markdown 的语法受到了以下这些 text-to-HTML 过滤器的影响 -- 包括 `Setext, atx, Textile, reStructuredText, Grutatext, 还有 EtText` 但是 Markdown 语法灵感最大的来源还是纯文本 email 的格式.  
> 基于以上背景, Markdown 完全由标点符号组成, 这些标点经过仔细挑选以使他们看上去和表达的含义相同. 例如, 星号标记的单词就像 _强调_. 列表就像是列表. 如果你使用过 email 的话, 就连块引用都像引用的文本段落.

#### 内联 HTML：

> Markdown 是用于 创作 web 文档的.  
> Markdown 从来都不是要取代 HTML . 它的语法集非常小, 只对应一小部分 HTML 标签. 它要做的 不是 创造一种新的语法以使插入 HTML 标签变得更容易. 在我看来, HTML 标签已经很容易插入了. Markdown 的目标是易于阅读, 创作和编辑文章. HTML 是一种 发布 格式; Markdown 是一种 创作 格式. 因此, Markdown 处理的都是纯文本.  
> 对于 Markdown 中未包含的标签, 可以直接使用 HTML. 没有必要使用定界符或标识符来表明从 Markdown 切换到 HTML; 直接使用标签就行了.  
> 唯一的限制就是对于 HTML 块级元素 ： 像 `<div>、<table>、<pre>、<p>` 等等. 必须另起一行单独放 , 并且开始和结束标签前面不能有任何缩进. Markdown 会自动识别这些块级元素而不会在他们周围添加额外的 `<p>` 标签.  
> 例如, 下面是添加 HTML 表格到 Markdown 文件:

```html
This is a regular paragraph.

<table>
    <tr>
        <td>Foo</td>
    </tr>
</table>

This is another regular paragraph.
```

> 注意 Markdown 语法结构在 HTML 块级元素中不会被处理. 例如, 你不该在 HTML 块级元素中使用 Markdown 式的语法如 _emphasis_ .  
> HTML 内联元素 -- 例如 `<span>、<cite>和 <del>` 可以在 Markdown 段落, 列表项, 标题中任意使用. 如果你乐意, 你甚至可以使用 HTML 标签替代 Markdown 格式; 例如你可以用 HTML `<a>` 和 `<img>` 标签替代 Markdown 的链接和图片语法.  
> 不同于 HTML 块级元素, Markdown 语法可以在内联元素中解析.

### Markdown 表格写法（适用 Github）：

由上面的 [Markdown 中文文档](https://markdown-zh.readthedocs.io/en/latest/overview/) 可知，表格的写法应该有两种：其一是 HTML-Table 标签写法；其二是基于 Markdown 自身的写法；具体请参看下面:

#### 1\. HTML-Table 写法：

> 详细请参考 [HTML-Table 标签](http://www.w3school.com.cn/tags/tag_table.asp)，这里不再赘述。

#### 2\. Markdown 写法：

> 参考文章：[Organizing information with tables](https://help.github.com/articles/organizing-information-with-tables/)

Markdown 采用`|` 和 `-` 创建表格。其中 `-` 用于创建每个列的标题，而 `|` 用于分隔每个列。创建表格前需添加一个空行才能正确呈现。

**代码：**

```markdown
| First Header  | Second Header |
| ------------- | ------------- |
| Content Cell  | Content Cell  |
| Content Cell  | Content Cell  |
```

**效果：**

| First Header | Second Header |
| --- | --- |
| Content Cell | Content Cell |
| Content Cell | Content Cell |

单元格的宽度可以不同，并且不需要在列内完美对齐。标题行的每列中必须至少有三个连字符。

**代码：**

```markdown
| Command | Description |
| --- | --- |
| git status | List all new or modified files |
| git diff | Show file differences that haven't been staged |
```

**效果：**

| Command | Description |
| --- | --- |
| git status | List all new or modified files |
| git diff | Show file differences that haven't been staged |

格式化表格中的链接、内嵌代码块和文本样式。

**代码：**

```markdown
| Command | Description |
| --- | --- |
| `git status` | List all *new or modified* files |
| `git diff` | Show file differences that **haven't been** staged |
| `Blog Link` | <https://blog.chiloh.cn> |
```

**效果：**

| Command | Description |
| --- | --- |
| `git status` | List all _new or modified_ files |
| `git diff` | Show file differences that **haven't been** staged |
| `Blog Link` | [https://blog.chiloh.cn](https://wblog.chiloh.cn) |

在标题行中的 `-` 的左侧，右侧或两侧使用 `:` 来调整文本居左，居右或居中。

**代码：**

```markdown
| Left-aligned | Center-aligned | Right-aligned |
| :--- |     :---:      |          ---: |
| git status   | git status     | git status    |
| git diff     | git diff       | git diff      |
```

**效果：**

| Left-aligned | Center-aligned | Right-aligned |
| :-- | :-: | --: |
| git status | git status | git status |
| git diff | git diff | git diff |

在单元格内要使用 `|` ，在 `|` 前添加 `\` 来转义。typecho 中似乎不能用，因此换用`|`的 Ascii 码`&#124`来实现。

**代码：**

```markdown
| Name     | Character |
| --- | --- |
| Backtick | 、        |
| Pipe     | &#124     |
```

**效果：**

| Name | Character |
| --- | --- |
| Backtick | 、 |
| Pipe | | |

#### 3\. 高级表格

如果想要对表格进行优化，则可以考虑使用 CSS 实现。有些 Markdown 解析是支持语法混用的，typecho不支持，所以纯用 html 写表格。

**代码：**

```html
<style type="text/css">
.bg table, td, th
{
    border:1px solid grey; //设置表格边框颜色
}
.bg table th:nth-of-type(1) {
    width: 12%; //设置表格列宽，（1）代表第一列
}
.bg table th:nth-of-type(2) {
    width: 24%; //设置表格列宽，（2）代表第一列
}
.bg table td:nth-of-type(1) {
    color: red; //设置表格列色，（1）代表第一列
}
.bg table td:nth-of-type(2) {
    color: green; //设置表格列色，（2）代表第二列
}
</style>

<div class="bg">

<table>
    <tr>
        <td>编号</td>
        <td>名称</td>
        <td>简介</td>
    </tr>
    <tr>
        <td>1</td>
        <td>Apple</td>
        <td>苹果</td>
    </tr>
    <tr>
        <td>2</td>
        <td>Banana</td>
        <td>香蕉</td>
    </tr>
    <tr>
        <td>3</td>
        <td>Lemon</td>
        <td>柠檬</td>
    </tr>
</table>

</div>
```

**效果：**

.bg table, td, th { border:1px solid grey; } .bg table th:nth-of-type(1) { width: 12%; } .bg table th:nth-of-type(2) { width: 24%; } .bg table td:nth-of-type(1) { color: red; } .bg table td:nth-of-type(2) { color: green; }

<table><tbody><tr><td>编号</td><td>名称</td><td>简介</td></tr><tr><td>1</td><td>Apple</td><td>苹果</td></tr><tr><td>2</td><td>Banana</td><td>香蕉</td></tr><tr><td>3</td><td>Lemon</td><td>柠檬</td></tr></tbody></table>
