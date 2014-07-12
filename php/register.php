<?php
    $uname = $_POST['uname'];
    $pword = $_POST['pword'];
    $email = $_POST['email'];

	//包含数据库连接文件
    include('conn.php');

    //写入数据
    $pword = MD5($pword);
    $query = "INSERT INTO user(uname,pword,email)VALUES('$uname','$pword','$email')";	
	if ($mysqli->query($query, MYSQLI_STORE_RESULT)){
	    session_start();//注册成功后自动登录
		$query = "select uid from user where uname='$uname' and pword='$pword' limit 1";
		$result = $mysqli->query($query)->fetch_array();
        //登录成功
        $_SESSION['uname'] = $uname;
        $_SESSION['uid'] = $result['uid'];
		copy("../images/icons/icon0.png","../images/icons/icon".$result['uid'].".png"); //设置默认头像
        echo '1'.$_SESSION['uid']; //注册成功
		exit;
    } else {
        echo '0';  //注册失败
		exit;
    }
?>