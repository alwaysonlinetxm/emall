<?php
    session_start();
	
    $gid = explode('|', urldecode($_GET['gid'])); //解码

	//包含数据库连接文件
    include('conn.php');
	
	$data = "";
	for ($i = 0; $i < count($gid); $i++){
		$query = "select gdis, gprice, gfare, gstock from goods where gid='$gid[$i]'";
		$result = $mysqli->query($query, MYSQLI_STORE_RESULT)->fetch_array();
		$data .= $result["gdis"]."|".$result["gprice"]."|".$result["gfare"]."|".$result["gstock"]."&";
	}
	echo substr($data, 0 , -1);
?>