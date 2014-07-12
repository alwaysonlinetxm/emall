<?php
    session_start();//开始一个会话或维持当前会话
	
    $oid = urldecode($_GET['oid']);
    $opword = MD5(urldecode($_GET['opword']));

    //包含数据库连接文件
    include('../conn.php');
	
    //检测用户名及密码是否正确
	$query = "select * from owner where oid='$oid' and opword='$opword' limit 1";
	$check_query = $mysqli->query($query);
	if ($result = $check_query->fetch_array()){
        //登录成功
        $_SESSION['oid'] = $result['oid'];
        echo '1';
        exit;
    } else {
	    echo '0';
        exit;
    }
?>