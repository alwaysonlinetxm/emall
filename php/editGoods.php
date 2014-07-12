<?php
    session_start();
	
	$type = urldecode($_GET['type']); //解码
	if ($type == "alter" || $type == "dele"){
		$gid = urldecode($_GET['gid']); //解码
	}
	if ($type == "alter" || $type == "add"){
		$tag = urldecode($_GET['tag']); //解码
		$dis = urldecode($_GET['dis']); //解码
		$detail = urldecode($_GET['detail']); //解码
		$place = urldecode($_GET['place']); //解码
		$stock = urldecode($_GET['stock']); //解码
		$price = urldecode($_GET['price']); //解码
		$fare = urldecode($_GET['fare']); //解码
		$oid = urldecode($_GET['oid']); //解码
	}
	//包含数据库连接文件
    include('conn.php');
	
	switch ($type){
		case "dele": $query = "delete from goods where gid='$gid'";	
			if (file_exists("../images/cover/".$gid.".jpg")) {  //删除封面图片
				unlink("../images/cover/".$gid.".jpg");
			}
			$status = $mysqli->query($query, MYSQLI_STORE_RESULT);
			break;
		case "add": $query = "insert into goods (gtype, gdis, gdetail, oid, gplace, gstock, gprice, gfare) values ('$tag', '$dis', '$detail', '$oid', '$place', '$stock', '$price', '$fare')";
			$status = $mysqli->query($query, MYSQLI_STORE_RESULT);
			//设置默认封面
			$newid = $mysqli->insert_id;
			copy("../images/cover/000000.jpg","../images/cover/".str_pad($newid,6,'0',STR_PAD_LEFT).".jpg");		
			break;
		case "alter": $query = "update goods set gtype='$tag', gdis='$dis', gdetail='$detail', oid='$oid', gplace='$place', gstock='$stock', gprice='$price', gfare='fare' where gid='$gid'";
			$status = $mysqli->query($query, MYSQLI_STORE_RESULT);
			break;
	}
	if ($status){
		echo '1';
	} else {
		echo '0';
	}

?>