<?php
    session_start();
	
	$uid = urldecode($_GET['uid']); //解码
	$time = urldecode($_GET['time']); //解码
	$goods = explode(' ', urldecode($_GET['goods'])); //解码
	//包含数据库连接文件
    include('conn.php');
	$count = 0; //成功计数器
	for ($i = 0; $i < count($goods); $i++){
		$info = explode('|', $goods[$i]);
		$query = "insert into bill (uid, gid, gnum, btime) values ('$uid', '$info[0]', '$info[1]', '$time')";		
		if ($mysqli->query($query, MYSQLI_STORE_RESULT)){ $count++; }
		$query = "delete from cart where uid='$uid' and gid='$info[0]'";
		$mysqli->query($query, MYSQLI_STORE_RESULT);
	}
	if ($count == count($goods)){
		echo '1';
	} else {
		echo '0';
	}
?>