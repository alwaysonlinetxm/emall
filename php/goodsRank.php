<?php
    session_start();
	//包含数据库连接文件
    include('conn.php');

    $query = "select gid, gdis from goods order by gsale DESC limit 9";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);	
	$rank = "";
	while ($result = $check_query->fetch_array()){
        $rank .= $result["gid"].$result["gdis"]."|";
    } 
	echo substr($rank, 0, -1);
?>