<?php
    session_start();
	
    $num = urldecode($_GET['num']); //解码
	//包含数据库连接文件
    include('conn.php');

    $query = "select gid, gdis, gprice, gfare from goods order by gsale DESC limit $num";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);	
	$recom = "";
	while ($result = $check_query->fetch_array()){
		$recom .= $result["gid"]."#".$result["gdis"]."#".$result["gprice"]."#".$result["gfare"]."|";
    } 
	echo substr($recom, 0, -1);
?>