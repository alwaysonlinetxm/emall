<?php
    session_start();//开始一个会话或维持当前会话
	
    $gid = urldecode($_GET['gid']); //解码

    //包含数据库连接文件
    include('conn.php');
	
    //建立匹配查询串
	$list = "";
	$query = "select sname, sfile from song where gid='$gid'";
	$check_query = $mysqli->query($query);
	while ($result = $check_query->fetch_array()){
        $list = $list.$result["sname"]."|".$result["sfile"]."|";
    }
	if ($list != ""){
		echo substr($list, 0, -1);
	} else {
		echo 0;
	}
	
?>