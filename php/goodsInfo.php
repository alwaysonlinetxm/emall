<?php
    session_start();
	
    $gid = urldecode($_GET['gid']); //解码

	//包含数据库连接文件
    include('conn.php');

	$deal = 0; //成交数量
	$query = "select * from bill where gid='$gid'";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);
	while ($result = $check_query->fetch_array()){
		$deal++;
	} 
	$query = "select egrade from eval where gid='$gid'";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);
	$num = 0;
	$grade = 0;
	while ($result = $check_query->fetch_array()){
		$grade += $result["egrade"];
		$num++;
	}
	//有评分时才做平均
	if ($num != 0){ $grade /= $num; }
	$query = "select * from coll where gid='$gid'";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);
	$coll = 0;
	while ($result = $check_query->fetch_array()){ $coll++; }
    $query = "select gdis, gdetail, gplace, gstock, gprice, gfare, gsale, oid, gtype from goods where gid='$gid'";
    $check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);	
	if ($result = $check_query->fetch_array()){
		//获取信息成功
        echo '1'.$result['gdis']."|".$result['gdetail']."|".$result['gplace']."|".$result['gstock']."|".$result['gprice']."|".$result['gfare']."|".$result['gsale']."|".$grade."|".$num."|".$coll."|".$result['oid']."|".$deal."|".$result['gtype']; 
		exit;
    } else {
        echo '0';  //获取信息失败
		exit;
    } 
?>