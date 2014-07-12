<?php
    $mysqli = new mysqli('localhost', 'root', 'txm19921005', 'emall');
	if (!$mysqli){
        die("连接数据库失败：" . mysql_error()); //返回上一个 MySQL 操作产生的文本错误信息
    }
	//字符转换，读库
	$mysqli->query("set character set 'utf8'");
	//写库
	$mysqli->query("set names 'utf8'");
?>