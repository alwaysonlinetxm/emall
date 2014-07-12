<?php
	$word = urldecode($_GET['word']); //解码

	//包含数据库连接文件
    include('conn.php');
	
    //匹配关键字__halt_compiler
	$query = "select kword from keyword where kword like '".$word."%' limit 10";
	$check_query = $mysqli->query($query);
	$words = "";
	while ($result = $check_query->fetch_array()){
        $words = $words.$result['kword']."|";
    } 
	if ($words != ""){
		echo substr($words, 0, -1);
	} else {
		echo "";
	}
?>