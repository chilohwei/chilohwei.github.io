---
layout: post
title: "Frp 内网穿透"
summary: 一直想在公司或者出差时，能够随时远程访问家里电脑，互传文件。在综合考量了许多方法之后，基于正在使用的 [阿里云 ECS 服务器](https://www.aliyun.com/activity/daily/bestoffer?userCode=4rw8hc7d) 有分配公网 IP 地址，最终选择了 Frp 内网穿透服务。目前已基本实现随时随地访问家里Windows电脑的需求。
date: "2020-09-28"
categories: "Tech"
---

一直想在公司或者出差时，能够随时远程访问家里电脑，互传文件。在综合考量了许多方法之后，基于正在使用的 [阿里云 ECS 服务器](https://www.aliyun.com/activity/daily/bestoffer?userCode=4rw8hc7d) 有分配公网 IP 地址，最终选择了 Frp 内网穿透服务。目前已基本实现随时随地访问家里Windows电脑的需求。

### 一、服务端配置

以 CentOS 服务器为例，Frps服务端配置教程如下：

#### 1\. 安装 Go 环境

Frp是基于Go语言的，因此参考此教程：[https://golang.org/doc/install#requirements](https://golang.org/doc/install#requirements)，首先在 Linux 上 安装 Go 语言并配置环境。

#### 2\. 安装 Frps 并启动

这里推荐[Frp 服务端一键脚本](https://github.com/MvsCode/frps-onekey)，相比源码配置的方式，更为简单。只需要按照步骤提示，输入相应的端口号即可。

```bash
+------------------------------------------------------------+
|   frps for Linux Server, Author Clang ，Mender MvsCode     |
|      A tool to auto-compile & install frps on Linux        |
+------------------------------------------------------------+

Check your server setting, please wait...

+------------------------------------------------------------+
|   frps for Linux Server, Author Clang ，Mender MvsCode     |
|      A tool to auto-compile & install frps on Linux        |
+------------------------------------------------------------+


Please select frps download url:
[1].aliyun 
[2].github (default)
Enter your choice (1, 2 or exit. default [github]): 1
-----------------------------------
       Your select: 1    
-----------------------------------
Loading network version for frps, please wait...
frps Latest release file frp_0.34.3_linux_amd64.tar.gz
Loading You Server IP, please wait...
You Server IP:your_vps_ip
————————————————————————————————————————————
     Please input your server setting:
————————————————————————————————————————————

Please input frps bind_port [1-65535](Default Server Port: 5443):
frps bind_port: 5443


Please input frps vhost_http_port [1-65535](Default : 80):8080
frps vhost_http_port: 8080


Please input frps vhost_https_port [1-65535](Default : 443):8888
frps vhost_https_port: 8888


Please input frps dashboard_port [1-65535](Default : 6443):
frps dashboard_port: 6443


Please input frps dashboard_user(Default : admin):chiloh
frps dashboard_user: chiloh


Please input frps dashboard_pwd(Default : N2qeE26x):chiloh-wei
frps dashboard_pwd: chiloh-wei


Please input frps token(Default : p57D0IwDHL3LwpJC):your_token
frps token: your_token


Please input frps subdomain_host(Default : your_vps_ip):
frps subdomain_host: your_vps_ip


Please input frps max_pool_count [1-200]
(Default : 50):
frps max_pool_count: 50

Please select log_level
1: info (default)
2: warn
3: error
4: debug
-------------------------
Enter your choice (1, 2, 3, 4 or exit. default [1]): 
log_level: info


Please input frps log_max_days [1-30]
(Default : 3 day):
frps log_max_days: 3

Please select log_file
1: enable (default)
2: disable
-------------------------
Enter your choice (1, 2 or exit. default [1]): 
log_file: enable

Please select tcp_mux
1: enable (default)
2: disable
-------------------------
Enter your choice (1, 2 or exit. default [1]): 
tcp_mux: true

Please select kcp support
1: enable (default)
2: disable
-------------------------
Enter your choice (1, 2 or exit. default [1]): 
kcp support: true

============== Check your input ==============
You Server IP      : your_vps_ip
Bind port          : 5443
kcp support        : true
vhost http port    : 8080
vhost https port   : 8888
Dashboard port     : 6443
Dashboard user     : chiloh
Dashboard password : chiloh-wei
token              : your_token
subdomain_host     : your_vps_ip
tcp_mux            : true
Max Pool count     : 50
Log level          : info
Log max days       : 3
Log file           : enable
==============================================

Press any key to start...or Press Ctrl+c to cancel
frps install path:/usr/local/frps
config file for frps ... done
download frps ... done
download /etc/init.d/frps... done
setting frps boot... done

+---------------------------------------------------------+
|     Manager for Frps, Author Clang, Mender MvsCode      |
+---------------------------------------------------------+

Starting Frps(0.34.3)... done
Frps (pid 31075)is running.

+------------------------------------------------------------+
|   frps for Linux Server, Author Clang ，Mender MvsCode     |
|      A tool to auto-compile & install frps on Linux        |
+------------------------------------------------------------+


Congratulations, frps install completed!
================================================
You Server IP      : your_vps_ip
Bind port          : 5443
KCP support        : true
vhost http port    : 8080
vhost https port   : 8888
Dashboard port     : 6443
token              : your_token
subdomain_host     : your_vps_ip
tcp_mux            : true
Max Pool count     : 50
Log level          : info
Log max days       : 3
Log file           : enable
================================================
frps Dashboard     : http://your_vps_ip:6443/
Dashboard user     : chiloh
Dashboard password : chiloh-wei
================================================

frps status manage : frps {start|stop|restart|status|config|version}
Example:
  start: frps start
   stop: frps stop
restart: frps restart
```

**注意：**如果是阿里云等服务商，需要在服务器的安全组里，放行上述脚本配置中的端口。

### 二、客户端配置

客户端配置方法与服务端类似，步骤如下：

#### 1\. 安装 Frp c并启动

- 在该页面：[https://github.com/fatedier/frp/releases](https://github.com/fatedier/frp/releases)下载最新版的 Windows 版本 Frp 压缩包。
- 解压 frpc.ini 、 frpc.exe 到Windows某个目录下，比如 D:\\frp
- 参考下方代码，编辑客户端配置文件 frpc.ini 。

```
[common]
#vps的公网地址
server_addr = your_vps_ip
#之前配置的frps的bind_port
server_port = 5443
#之前配置的frps的token
token=your_token
#name随便取
[RDP]
#type就tcp不变
type = tcp
#本地地址不变
local_ip = 127.0.0.1
#windows远程的3389端口不变
local_port = 3389
#被远程时，访问的端口，取值[1024-65535]
remote_port = 6000
```

#### 2\. 配置 Frp c 自启动

配置好服务端后，最好设置下自启动，这样子windows电脑开启的时候，服务就会在后台运行。具体步骤如下：

- 下载[winsw](https://github.com/kohsuke/winsw/releases)，并重命名为winsw.exe
- 新建一个winsw.xml格式文件，写入下面的内容：

```xml
<service>
    <id>frp</id>
    <name>frpc</name>
    <description>chiloh's frpc</description>
    <executable>frpc</executable>
    <arguments>-c frpc.ini</arguments>
    <onfailure action="restart" delay="60 sec"/>
    <onfailure action="restart" delay="120 sec"/>
    <logmode>reset</logmode>
</service>
```

- 新建一个注册.bat，写入下面的内容：

```bat
@echo off
if exist "%SystemRoot%\SysWOW64" path %path%;%windir%\SysNative;%SystemRoot%\SysWOW64;%~dp0
bcdedit >nul
if '%errorlevel%' NEQ '0' (goto UACPrompt) else (goto UACAdmin)
:UACPrompt
%1 start "" mshta vbscript:createobject("shell.application").shellexecute("""%~0""","::",,"runas",1)(window.close)&exit
exit /B
:UACAdmin
cd /d "%~dp0"
echo 当前运行路径是：%CD%
echo 已获取管理员权限

winsw install
winsw start
```

- 新建一个卸载.bat，写入下面的内容：

```bat
@echo off
if exist "%SystemRoot%\SysWOW64" path %path%;%windir%\SysNative;%SystemRoot%\SysWOW64;%~dp0
bcdedit >nul
if '%errorlevel%' NEQ '0' (goto UACPrompt) else (goto UACAdmin)
:UACPrompt
%1 start "" mshta vbscript:createobject("shell.application").shellexecute("""%~0""","::",,"runas",1)(window.close)&exit
exit /B
:UACAdmin
cd /d "%~dp0"
echo 当前运行路径是：%CD%
echo 已获取管理员权限

winsw stop
winsw uninstall
```

- 双击运行注册.bat文件，即可注册好服务。之后就可以使用ip+remote\_port的形式访问内网的windows电脑了。

![Frp远程桌面连接](https://chilohdata.s3.bitiful.net/blog/frp-rdp.jpg "Frp远程桌面连接")

### 三、总体感受

Frp 的搭建过程，使用脚本的话难度不是很大，最大的要求应该就是公网 IP 地址了。另外，买一个家用智能插座，设置电脑通电后自动开机，就可以远程控制家里电脑开关机了。电脑开机后，自启动内网穿透服务，在任何地方，只要有网，就可以打开平板或者电脑来访问家里电脑，远程操作或者传输文件。

**参考文章：**

- [Frp 服务端一键脚本](https://github.com/MvsCode/frps-onekey)
- [Frp简单安装配置，并开机自启](https://www.jianshu.com/p/188273596f0e)
