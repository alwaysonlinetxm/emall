<?php
    session_start();
	
	$oid = urldecode($_GET['oid']); //解码
    $gid = urldecode($_GET['gid']); //解码
	//包含数据库连接文件
    include('conn.php');

    $query = "select gid, gdis, gprice, gfare from goods where oid='$oid' order by gsale DESC limit 5";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);	
	$i = 0;
	$inter = "";
	while ($result = $check_query->fetch_array()){
		if ($result["gid"] != $gid){
			$inter .= $result["gid"]."#".$result["gdis"]."#".$result["gprice"]."#".$result["gfare"]."|";
			if (++$i == 4) { break; }
		}
    } 
	echo substr($inter, 0, -1);
?>