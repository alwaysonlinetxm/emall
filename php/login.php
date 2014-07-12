<?php
    session_start();//开始一个会话或维持当前会话
	
    $uname = htmlspecialchars(urldecode($_GET['uname']));//将特殊字符转成 HTML 格式( &....; )
    $pword = MD5(urldecode($_GET['pword']));

    //包含数据库连接文件
    include('conn.php');
	
    //检测用户名及密码是否正确
	$query = "select * from user where uname='$uname' and pword='$pword' limit 1";
	$check_query = $mysqli->query($query);
	if ($result = $check_query->fetch_array()){
        //登录成功
        $_SESSION['uname'] = $uname;
        $_SESSION['uid'] = $result['uid'];
        echo '1'.$_SESSION['uid'];
        exit;
    } else {
	    echo '0';
        exit;
    }
?>