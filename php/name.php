<?php
	$uname = urldecode($_GET['uname']); //解码

	//包含数据库连接文件
    include('conn.php');
	
    //检测用户名是否已经存在
	$check_query = $mysqli->query("select uid from user where uname='$uname' limit 1");
	if ($result = $check_query->fetch_array()){
        echo '1';
    } else {
	    echo '0';
	}
?>