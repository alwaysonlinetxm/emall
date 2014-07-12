<?php
    session_start();
	
	$uid = $_POST['uid']; 
	$gid = $_POST['gid'];
	$econt = $_POST['cont'];
	$egrade = $_POST['grade'];
	$etime = $_POST['time'];

	//包含数据库连接文件
    include('conn.php');

	$query = "insert into eval (uid, gid, egrade, econt, etime) values ('$uid', '$gid', '$egrade', '$econt', '$etime')";		
	if ($mysqli->query($query, MYSQLI_STORE_RESULT)){ 
		echo '1';
	} else {
		echo '0';
	}
?>