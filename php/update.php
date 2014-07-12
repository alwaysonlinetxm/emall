<?php
    session_start();
	
	$type = $_POST['type'];
	$uid = $_POST['uid'];
	$query = "update user set ";
	
	if ($type == "info") {
		$fields = array('uname','email');
		while ($elem = each($fields)) { 
			$field = $_POST[$elem['value']];
			if (strcmp($field, "") != 0){
				if (strlen($query) != 16){ //非第一个字段时，加上‘，’
					$query = $query.",";
				}
				/* if (strcmp($elem['value'], 'pword') == 0){ //当是密码字段时，加密
					$field = MD5($field);
				} */
				$query = $query.$elem['value']."='".$field."' ";
			}    
		}
	} else {
		$pword = MD5($_POST['pword']);
		$query = $query."pword='$pword' ";
	}
	$query = $query."where uid='$uid'";
	//包含数据库连接文件
    include('conn.php');

    //写入数据
	if ($mysqli->query($query, MYSQLI_STORE_RESULT)){
        if ($type == "info"){ $_SESSION['uname'] = $_POST['uname']; }
        echo '1'; //更新成功
	} else {
	    echo '0';  //更新失败
	}
?>