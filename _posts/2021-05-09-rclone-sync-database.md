---
layout: post
title: "数据 Rclone 定期同步"
summary: 上一篇文章：[Typecho 博客脚本备份与恢复](https://www.chiloh.cn/archives/typecho-backup.html) 中有提到怎么用脚本定时备份网站数据库。今天来分享下如何使用Rclone将备份的数据，自动同步到Google云盘或者阿里云OSS等S3存储上。
date: "2021-05-09"
categories: "Tech"
---

上一篇文章：[Typecho 博客脚本备份与恢复](https://blog.chiloh.cn/2019-07-13/typecho-backup.html) 中有提到怎么用脚本定时备份网站数据库。今天来分享下如何使用Rclone将备份的数据，自动同步到Google云盘或者阿里云OSS等S3存储上。

### 一、安装Rclone

登录到服务器终端，执行下方命令：

```bash
curl https://rclone.org/install.sh | sudo bash
```

如果之前没有安装过`curl`，请执行下方命令完成安装：

```bash
yum -y install curl
```

### 二、配置Rclone

安装成功后，输入：

```bash
rclone config
```

弹出下方操作命令，按提示操作即可：

```bash
2021/05/09 12:48:01 NOTICE: Config file "/root/.config/rclone/rclone.conf" not found - using defaults
No remotes found - make a new one
n) New remote
s) Set configuration password
q) Quit config
```

输入`n`新建，`name`自定义后，弹出要连接的存储：

```bash
name> Alibaba
Type of storage to configure.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / 1Fichier
   \ "fichier"
 2 / Alias for an existing remote
   \ "alias"
 3 / Amazon Drive
   \ "amazon cloud drive"
 4 / Amazon S3 Compliant Storage Providers including AWS, Alibaba, Ceph, Digital Ocean, Dreamhost, IBM COS, Minio, and Tencent COS
   \ "s3"
 5 / Backblaze B2
   \ "b2"
 6 / Box
   \ "box"
 7 / Cache a remote
   \ "cache"
 8 / Citrix Sharefile
   \ "sharefile"
 9 / Compress a remote
   \ "compress"
10 / Dropbox
   \ "dropbox"
11 / Encrypt/Decrypt a remote
   \ "crypt"
12 / Enterprise File Fabric
   \ "filefabric"
13 / FTP Connection
   \ "ftp"
14 / Google Cloud Storage (this is not Google Drive)
   \ "google cloud storage"
15 / Google Drive
   \ "drive"
16 / Google Photos
   \ "google photos"
17 / Hadoop distributed file system
   \ "hdfs"
18 / Hubic
   \ "hubic"
19 / In memory object storage system.
   \ "memory"
20 / Jottacloud
   \ "jottacloud"
21 / Koofr
   \ "koofr"
22 / Local Disk
   \ "local"
23 / Mail.ru Cloud
   \ "mailru"
24 / Mega
   \ "mega"
25 / Microsoft Azure Blob Storage
   \ "azureblob"
26 / Microsoft OneDrive
   \ "onedrive"
27 / OpenDrive
   \ "opendrive"
28 / OpenStack Swift (Rackspace Cloud Files, Memset Memstore, OVH)
   \ "swift"
29 / Pcloud
   \ "pcloud"
30 / Put.io
   \ "putio"
31 / QingCloud Object Storage
   \ "qingstor"
32 / SSH/SFTP Connection
   \ "sftp"
33 / Sugarsync
   \ "sugarsync"
34 / Tardigrade Decentralized Cloud Storage
   \ "tardigrade"
35 / Transparently chunk/split large files
   \ "chunker"
36 / Union merges the contents of several upstream fs
   \ "union"
37 / Webdav
   \ "webdav"
38 / Yandex Disk
   \ "yandex"
39 / Zoho
   \ "zoho"
40 / http Connection
   \ "http"
41 / premiumize.me
   \ "premiumizeme"
42 / seafile
   \ "seafile"
```

以阿里云OSS为例，在终端下输入`4`，然后选择`2`，按下方提示操作：

```bash
Storage> 4
** See help for s3 backend at: https://rclone.org/s3/ **

Choose your S3 provider.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / Amazon Web Services (AWS) S3
   \ "AWS"
 2 / Alibaba Cloud Object Storage System (OSS) formerly Aliyun
   \ "Alibaba"
 3 / Ceph Object Storage
   \ "Ceph"
 4 / Digital Ocean Spaces
   \ "DigitalOcean"
 5 / Dreamhost DreamObjects
   \ "Dreamhost"
 6 / IBM COS S3
   \ "IBMCOS"
 7 / Minio Object Storage
   \ "Minio"
 8 / Netease Object Storage (NOS)
   \ "Netease"
 9 / Scaleway Object Storage
   \ "Scaleway"
10 / StackPath Object Storage
   \ "StackPath"
11 / Tencent Cloud Object Storage (COS)
   \ "TencentCOS"
12 / Wasabi Object Storage
   \ "Wasabi"
13 / Any other S3 compatible provider
   \ "Other"
provider> 2
Get AWS credentials from runtime (environment variables or EC2/ECS meta data if no env vars).
Only applies if access_key_id and secret_access_key is blank.
Enter a boolean value (true or false). Press Enter for the default ("false").
Choose a number from below, or type in your own value
 1 / Enter AWS credentials in the next step
   \ "false"
 2 / Get AWS credentials from the environment (env vars or IAM)
   \ "true"
env_auth> 1
AWS Access Key ID.
Leave blank for anonymous access or runtime credentials.
Enter a string value. Press Enter for the default ("").
access_key_id> 
AWS Secret Access Key (password)
Leave blank for anonymous access or runtime credentials.
Enter a string value. Press Enter for the default ("").
secret_access_key> 
Endpoint for OSS API.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / East China 1 (Hangzhou)
   \ "oss-cn-hangzhou.aliyuncs.com"
 2 / East China 2 (Shanghai)
   \ "oss-cn-shanghai.aliyuncs.com"
 3 / North China 1 (Qingdao)
   \ "oss-cn-qingdao.aliyuncs.com"
 4 / North China 2 (Beijing)
   \ "oss-cn-beijing.aliyuncs.com"
 5 / North China 3 (Zhangjiakou)
   \ "oss-cn-zhangjiakou.aliyuncs.com"
 6 / North China 5 (Huhehaote)
   \ "oss-cn-huhehaote.aliyuncs.com"
 7 / South China 1 (Shenzhen)
   \ "oss-cn-shenzhen.aliyuncs.com"
 8 / Hong Kong (Hong Kong)
   \ "oss-cn-hongkong.aliyuncs.com"
 9 / US West 1 (Silicon Valley)
   \ "oss-us-west-1.aliyuncs.com"
10 / US East 1 (Virginia)
   \ "oss-us-east-1.aliyuncs.com"
11 / Southeast Asia Southeast 1 (Singapore)
   \ "oss-ap-southeast-1.aliyuncs.com"
12 / Asia Pacific Southeast 2 (Sydney)
   \ "oss-ap-southeast-2.aliyuncs.com"
13 / Southeast Asia Southeast 3 (Kuala Lumpur)
   \ "oss-ap-southeast-3.aliyuncs.com"
14 / Asia Pacific Southeast 5 (Jakarta)
   \ "oss-ap-southeast-5.aliyuncs.com"
15 / Asia Pacific Northeast 1 (Japan)
   \ "oss-ap-northeast-1.aliyuncs.com"
16 / Asia Pacific South 1 (Mumbai)
   \ "oss-ap-south-1.aliyuncs.com"
17 / Central Europe 1 (Frankfurt)
   \ "oss-eu-central-1.aliyuncs.com"
18 / West Europe (London)
   \ "oss-eu-west-1.aliyuncs.com"
19 / Middle East 1 (Dubai)
   \ "oss-me-east-1.aliyuncs.com"
endpoint> 8
Canned ACL used when creating buckets and storing or copying objects.

This ACL is used for creating objects and if bucket_acl isn't set, for creating buckets too.

For more info visit https://docs.aws.amazon.com/AmazonS3/latest/dev/acl-overview.html#canned-acl

Note that this ACL is applied when server-side copying objects as S3
doesn't copy the ACL from the source but rather writes a fresh one.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / Owner gets FULL_CONTROL. No one else has access rights (default).
   \ "private"
 2 / Owner gets FULL_CONTROL. The AllUsers group gets READ access.
   \ "public-read"
   / Owner gets FULL_CONTROL. The AllUsers group gets READ and WRITE access.
 3 | Granting this on a bucket is generally not recommended.
   \ "public-read-write"
 4 / Owner gets FULL_CONTROL. The AuthenticatedUsers group gets READ access.
   \ "authenticated-read"
   / Object owner gets FULL_CONTROL. Bucket owner gets READ access.
 5 | If you specify this canned ACL when creating a bucket, Amazon S3 ignores it.
   \ "bucket-owner-read"
   / Both the object owner and the bucket owner get FULL_CONTROL over the object.
 6 | If you specify this canned ACL when creating a bucket, Amazon S3 ignores it.
   \ "bucket-owner-full-control"
acl> 3
The storage class to use when storing new objects in OSS.
Enter a string value. Press Enter for the default ("").
Choose a number from below, or type in your own value
 1 / Default
   \ ""
 2 / Standard storage class
   \ "STANDARD"
 3 / Archive storage mode.
   \ "GLACIER"
 4 / Infrequent access storage mode.
   \ "STANDARD_IA"
storage_class> 
Edit advanced config? (y/n)
y) Yes
n) No (default)
y/n> n
Remote config
--------------------
[gdrive]
type = s3
provider = Alibaba
env_auth = false
endpoint = oss-cn-hongkong.aliyuncs.com
acl = public-read-write
--------------------
y) Yes this is OK (default)
e) Edit this remote
d) Delete this remote
y/e/d> y
```

可以看到需要输入阿里云OSS的ID和密钥，可以先回车跳过，在阿里云配置好后再来编辑这部分；然后按照提示选择阿里云OSS的节点位置和读写权限，可参考上述选择（以香港节点、公共读写权限为例），若是其他节点，选择对应序号即可。

### 三、阿里云API配置

登录阿里云网页，点击右上角头像，进入**访问控制**，创建一个新用户，点选**编程访问**，并添加`AliyunOSSFullAccess`权限。

![创建用户](https://chilohdata.s3.bitiful.net/blog/aliyun-oss-accesskey.png "创建用户")

之后就可以获得阿里云OSS服务的ID和密钥了。

### 四、继续配置Rclone

重新在终端输入`rclone config`命令，按照下方操作进入编辑模式，补充阿里云OSS的ID和密钥。

```bash
Current remotes:

Name                 Type
====                 ====
Alibaba              s3

e) Edit existing remote
n) New remote
d) Delete remote
r) Rename remote
c) Copy remote
s) Set configuration password
q) Quit config
e/n/d/r/c/s/q> e
[Alibaba]
type = s3
provider = Alibaba
env_auth = false
endpoint = oss-cn-hongkong.aliyuncs.com
acl = public-read-write
--------------------
Edit remote
** See help for s3 backend at: https://rclone.org/s3/ **

Value "provider" = "Alibaba"
Edit? (y/n)>
y) Yes
n) No (default)
y/n> n
Value "env_auth" = "false"
Edit? (y/n)>
y) Yes
n) No (default)
y/n> y
Get AWS credentials from runtime (environment variables or EC2/ECS meta data if no env vars).
Only applies if access_key_id and secret_access_key is blank.
Enter a boolean value (true or false). Press Enter for the default ("false").
Choose a number from below, or type in your own value
 1 / Enter AWS credentials in the next step
   \ "false"
 2 / Get AWS credentials from the environment (env vars or IAM)
   \ "true"
env_auth> 1
Value "access_key_id" = ""
Edit? (y/n)>
y) Yes
n) No (default)
y/n> y
AWS Access Key ID.
Leave blank for anonymous access or runtime credentials.
Enter a string value. Press Enter for the default ("").
access_key_id> 这里输入获取到的阿里云OSS ID
Value "secret_access_key" = ""
Edit? (y/n)>
y) Yes
n) No (default)
y/n> y
AWS Secret Access Key (password)
Leave blank for anonymous access or runtime credentials.
Enter a string value. Press Enter for the default ("").
secret_access_key> 这里输入获取到的阿里云OSS 密钥
Value "endpoint" = "oss-cn-hongkong.aliyuncs.com"
Edit? (y/n)>
y) Yes
n) No (default)
y/n> n
Value "acl" = "public-read-write"
Edit? (y/n)>
y) Yes
n) No (default)
y/n> n
Value "storage_class" = ""
Edit? (y/n)>
y) Yes
n) No (default)
y/n> n
Edit advanced config? (y/n)
y) Yes
n) No (default)
y/n> n
--------------------
[Alibaba]
type = s3
provider = Alibaba
env_auth = false
endpoint = oss-cn-hongkong.aliyuncs.com
acl = public-read-write
access_key_id = 阿里云OSS ID
secret_access_key = 阿里云OSS密钥
--------------------
y) Yes this is OK (default)
e) Edit this remote
d) Delete this remote
y/e/d> y
```

到这里Rclone连接阿里云OSS的配置就全部完成了，想要连接Google Drive等其他存储，也是类似的道理。

### 五、脚本修改

在备份脚本的后面加上：

```bash
rclone copy /path/backup Alibaba:BucketName
```

其中`/path/backup`代表数据备份的目录，`Alibaba:BucketName`中的`Alibaba`是`rclone`操作过程中，新建的`remote`名称，后面的`BucketName`则是你阿里云OSS的存储桶名称。

如果想要定时自动同步数据到阿里云OSS的话，可以在终端键入`crontab -e`，然后输入：

```bash
0 18 * * 5 /bin/bash /root/jiaoben/backup.sh
```

其中：`0 18 * * 5`代表每隔7天的下午6点钟执行一次后面的命令；`root bash`代表以root身份执行bash命令；`/path/backup.sh`代表备份脚本存放的位置；`/path/wwwroot/domain.com`代表网站的根目录。
