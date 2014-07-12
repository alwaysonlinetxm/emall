<?php
    session_start();
	
	$type = urldecode($_GET['type']); //解码
	$uid = urldecode($_GET['uid']); //解码
    $gid = explode('|', urldecode($_GET['gid'])); //解码
	//包含数据库连接文件
    include('conn.php');
	
	$count = 0; //成功计数器
	for ($i = 0; $i < count($gid); $i++){
		$query = "delete from $type where uid='$uid' and gid='$gid[$i]'";	
		if ($mysqli->query($query, MYSQLI_STORE_RESULT)){ $count++; }
	}
	if ($count == count($gid)){
		echo '1';
	} else {
		echo '0';
	}
?>