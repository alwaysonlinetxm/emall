<?php
    session_start();
	
	
	$uid = urldecode($_GET['uid']); //解码
	$reply = urldecode($_GET['reply']); //解码
	$content = urldecode($_GET['content']); //解码
	$subdate = urldecode($_GET['subdate']); //解码
	//包含数据库连接文件
    include('conn.php');

	$query = "insert into message (reply, uid, content, subdate) values ('$reply', '$uid', '$content', '$subdate')";	
	if ($mysqli->query($query, MYSQLI_STORE_RESULT)){
		echo '1';
	} else {
		echo '0';
	}
?>