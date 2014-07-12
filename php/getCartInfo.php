<?php
    session_start();
	
	$uid = urldecode($_GET['uid']); //解码
	
	$filename = "../xml/".$uid."data.xml";
    if (file_exists($filename)) {  //删除旧文件
        unlink($filename);
    }
    //创建xml文件
    $rawMessage = "<?xml version=\"1.0\" encoding=\"utf-8\" ?>";
    $rawMessage .= "<data><headline>Data</headline>";
    $rawMessage .= "<author>Alwaysonline_TXM</author><entries></entries></data>";
  
    $xml = new SimpleXmlElement($rawMessage);
	//包含数据库连接文件
    include('conn.php');

	$query = "select goods.gid, gdis, gprice, gfare, gnum, gstock from goods, cart where uid='$uid' and goods.gid=cart.gid";
	$check_query = $mysqli->query($query, MYSQLI_STORE_RESULT);		
	while ($result = $check_query->fetch_array()){
		$entry = $xml->entries->addChild("entry");
		$entry->addChild("gid", $result['gid']);
		//addChild 方法中的第二个参数中，不能带有 & 这个符号(旧版本) 所以要间接赋值
		$entry->addChild("gdis", "");
		$entry->gdis = $result['gdis'];
		$entry->addChild("gprice", $result['gprice']);
		$entry->addChild("gfare", $result['gfare']);
		$entry->addChild("gnum", $result['gnum']);
		$entry->addChild("gstock", $result['gstock']);
    }
	echo $xml;	
    //写入数据
    $file = fopen($filename, 'w');
    fwrite($file, $xml->asXML());
    fclose($file);
?>