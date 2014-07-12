<?php
    session_start();
	
	$type = urldecode($_GET['type']); //解码
	$aid = urldecode($_GET['aid']); //解码
	$uid = urldecode($_GET['uid']); //解码
	if ($type == "add" || $type == "alter"){
		$person = urldecode($_GET['person']); //解码
		$region = urldecode($_GET['region']); //解码
		$street = urldecode($_GET['street']); //解码
		$post = urldecode($_GET['post']); //解码
		$mobile = urldecode($_GET['mobile']); //解码
		$default = urldecode($_GET['default']); //解码
	}
	//包含数据库连接文件
    include('conn.php');
	
	switch ($type){
		case "dele": $query = "delete from address where aid='$aid'";
			$status = $mysqli->query($query, MYSQLI_STORE_RESULT);
			break;
		case "default": $status = setDefault($aid, $uid);
			break;
		case "add": $query = "insert into address (uid, aperson, aregion, astreet, apost, amobile, adefault) values ('$uid', '$person', '$region', '$street', '$post', '$mobile', '$default')";
			$status = $mysqli->query($query, MYSQLI_STORE_RESULT);
			if ($default == "1") { $status = setDefault($mysqli->insert_id, $uid) && $status; }
			break;
		case "alter": $query = "update address set aperson='$person', aregion='$region', astreet='$street', apost='$post', amobile='$mobile', adefault='$default' where aid='$aid'";
			$status = $mysqli->query($query, MYSQLI_STORE_RESULT);
			if ($default == "1") { $status = setDefault($aid, $uid) && $status; }
			break;
	}
	if ($status){
		echo '1';
	} else {
		echo '0';
	}
	
function setDefault($aid, $uid){
	Global $mysqli;
	$query = "update address set adefault='0' where uid='$uid'";
	$mysqli->query($query, MYSQLI_STORE_RESULT);
	$query = "update address set adefault='1' where aid='$aid'";
	return $mysqli->query($query, MYSQLI_STORE_RESULT);
}

?>