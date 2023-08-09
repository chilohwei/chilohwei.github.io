---
layout: post
title: "Typecho 博客脚本备份与恢复"
summary: 原本使用的是Hexo博客，但由于静态博客设备间迁移比较麻烦，且数据备份不太方便，因此选换用成现在的Mysql + Typecho动态博客。这篇文章记录了我使用脚本备份该博客相关数据，以及Mysql数据恢复的操作过程，也算是一种记录和分享吧。
date: "2019-07-13"
categories: "Tech"
---

原本使用的是Hexo博客，但由于静态博客设备间迁移比较麻烦，且数据备份不太方便，因此选换用成现在的Mysql + Typecho动态博客。这篇文章记录了我使用脚本备份该博客相关数据，以及Mysql数据恢复的操作过程，也算是一种记录和分享吧。

### 一、脚本备份

该脚本是在网上搜索到的[Typecho网站数据备份脚本](https://www.typechodev.com/plugin/521.html)，我本人对该脚本做了少量修改，修改了命名规则与备份周期，同时为了方便，也将该脚本加入到了Crontab里进行定期自动备份。如果博客更新不是很频繁，也可以省掉该步骤使用人工手动备份。脚本代码和使用方法如下：

#### 用法：

上传脚本至VPS，执行`./backup_typecho.sh /path/to/yoursite.com/`即可开始备份，其中`/path/to/yoursite.com`为博客程序安装位置。备份结果放在`/var/backups/typecho/yoursite.com/`目录下（该目录可自定义）。

另外使用时注意给`/var/backups/`目录添加写入权限；如果需要添加Crontab自动备份，切换到`/etc/`目录下并编辑`crontab`加入定时任务。例如：`0 23 * * 6 root sudo /path/backup.sh /path/to/yoursite.com/`，则表示每周六晚11点定时执行该脚本，其中`/path/backup.sh`为脚本存放位置，`/path/to/yoursite.com/`为博客站点根目录（博客程序安装位置）。

```
#设置备份目录
backup_dir="/var/backups/typecho/"
function print_help(){
    echo 'Usage: $shell dir_to_typecho'
}

function die(){
    test -z "$1" || echo "$1"
    exit 1
}

function parse_db(){
    config_file=$2
    db_key=$1
    cat "$config_file" | grep -A 6 '$db' | grep '=>' | grep "$db_key" | awk -F "'" '{print $4}'
}


if [ "$#" -lt "1" ] 
then
    print_help
    exit 1
fi
te_dir="$1"
backup_dir="$backup_dir`basename "$te_dir"`"

#判断备份时间是否过频
min_time="43200" #12H
flag="/tmp/last_backup_typecho_`echo $te_dir | md5sum | awk '{print $1}'`"
last_backup="0"
test -f $flag && last_backup="`ls -l --time-style=+%s "$flag" | awk '{print $6}'`"
delta_time=$(expr "`date +%s`" - "$last_backup")

test "$delta_time" -lt "$min_time" && die "Time from last backup is less then $min_time, skip this time"


#初始化变量
te_config="$te_dir/config.inc.php"
te_usr_dir="$te_dir/usr"

#初始化环境
test -f "$te_config" || die "Can not find config file: $te_config"
test -d "$backup_dir" || mkdir -p "$backup_dir" || die "Can not create backup dir"

db_host=$(parse_db 'host' "$te_config")
db_port=$(parse_db 'port' "$te_config")
db_user=$(parse_db 'user' "$te_config")
db_pass=$(parse_db 'password' "$te_config")
db_name=$(parse_db 'database' "$te_config")

#备份数据库
echo "Found database config: host=$db_host, port=$db_port, user=$db_user, pass=**** and database=$db_name"
echo 'Try to dump database....'
dump_target='/tmp/database.sql';
test -f "$dump_target" && rm "$dump_target"
mysqldump -h"$db_host" -P"$db_port" -u"$db_user" -p"$db_pass" "$db_name" > "$dump_target"
echo 'Dump done.'

#备份usr目录
echo "Try to tar usr dir..."
tar_target="/tmp/user.tar.gz"
test -f "$tar_target" && rm "$tar_target"
tar czvf "$tar_target" "$te_usr_dir"
echo "Tar done."

echo "Try to pack..."
md5sum "$dump_target" > "$dump_target.md5sum"
md5sum "$tar_target" > "$tar_target.md5sum"
backup_file="$backup_dir/`basename "$te_dir"`.`date +%Y%m%d`.tar.gz"
tar czvf "$backup_file" "$dump_target" "$dump_target.md5sum" "$tar_target" "$tar_target.md5sum"

#清理临时文件
rm $tar_target
rm "$tar_target.md5sum"
rm $dump_target
rm "$dump_target.md5sum"

touch "$flag"
echo "Backup to $backup_file done."
```

### 二、数据恢复

由于我本人博客搭建在阿里云ECS服务器上，习惯使用[lnmp一键安装包](https://lnmp.org/notice/lnmp-v1-6.html)来安装网站环境，因此下面的方法可能具有一定局限性，请参考使用。具体步骤如下：

**第一步：**使用`lnmp vhost add`命令来添加域名，通常我会添加带`www`的和不带`www`的，并以`www`域名为主；且数据库名最好跟之前一样，可省去很多麻烦；

**第二步：**在该域名文件夹下，使用下面命令来下载、安装、启用Typecho博客程序，可参考[便宜VPS+LAMP搭建+博客一键安装教程](https://www.seoimo.com/wordpress-vps/#add-domain-name)这篇文章；

```
wget https://typecho.org/downloads/1.1-17.10.30-release.tar.gz //下载typecho程序压缩包
tar -zvxf 1.1-17.10.30-release.tar.gz //解压typecho程序压缩包
mv build/* . //移动解压出来的build文件夹里的内容到域名根目录下
rm -rf build 1.1-17.10.30-release.tar.gz //删除无用的文件
```

**第三步：**在浏览器输入域名，根据页面提示安装Typecho博客；建议做好HTTPS、HSTS、CDN等相关部署操作；

**第四步：**将之前备份的文件压缩包解压，将其中的`database.sql`上传到VPS，然后执行下面的命令即可导入原typecho后台设置及文章数据。

```
mysql -u 用户名 -p 密码 数据库名 < database.sql // 例如：mysql -u root -p 123456 DATA < database.sql
```

到了这一步，基本上就算是恢复成功了，剩下的就是解决其中可能遇到的杂七杂八的问题，如果没问题就不需要做太多处理了。

**补充：**想要将备份好的文件，定期从服务器自动同步到云盘，可以参考：[数据 Rclone 定期同步](https://blog.chiloh.cn//2021-05-09/rclone-sync-database.html)
