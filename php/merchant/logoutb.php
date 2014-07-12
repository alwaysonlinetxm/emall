<?php
    session_start();//开始一个会话或维持当前会话

   //注销登录
   if(urldecode($_GET['action']) == "logout"){
        unset($_SESSION['oid']);  //销毁指定的变量
        echo '1';
        exit;
    }
?>