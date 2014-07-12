<?php
    session_start();//开始一个会话或维持当前会话

   //注销登录
   if(urldecode($_GET['action']) == "logout"){
        unset($_SESSION['uid']);  //销毁指定的变量
		unset($_SESSION['uname']);
        echo '1';
        exit;
    }
?>