<?php
    session_start();
	
	$bid = urldecode($_GET['bid']); //解码
	//包含数据库连接文件
    include('conn.php');
	
	$query = "delete from bill where bid='$bid'";	
	if ($mysqli->query($query, MYSQLI_STORE_RESULT)){
		echo '1';
	} else {
		echo '0';
	}
?>