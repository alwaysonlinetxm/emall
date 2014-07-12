<?php
    session_start();
	
    $uname = urldecode($_GET['uname']); //解码

	//包含数据库连接文件
    include('conn.php');

    $query = "select * from user where uname='$uname'";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);	
	if ($result = $check_query->fetch_array()){
        echo '1'.$result['email']; //获取信息成功
		exit;
    } else {
        echo '0';  //获取信息失败
		exit;
    }
?>