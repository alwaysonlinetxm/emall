<?php
    session_start();//开始一个会话或维持当前会话
	
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
	
    //建立匹配查询串
	$query = "select bid, goods.gid, gdis, gprice, gfare, gnum, bstatus, btime from bill, goods where uid=$uid and goods.gid=bill.gid";
	$check_query = $mysqli->query($query);
	while ($result = $check_query->fetch_array()){
        $entry = $xml->entries->addChild("entry");
		$entry->addChild("bid", $result['bid']);
		$entry->addChild("gid", $result['gid']);
		//addChild 方法中的第二个参数中，不能带有 & 这个符号(旧版本) 所以要间接赋值
		$entry->addChild("gdis", "");
		$entry->gdis = $result['gdis'];
		$entry->addChild("gprice", $result['gprice']);
		$entry->addChild("gfare", $result['gfare']);
		$entry->addChild("gnum", $result['gnum']);
		$entry->addChild("bstatus", $result['bstatus']);
		$entry->addChild("btime", $result['btime']);
    } 
	echo $xml;	
    //写入数据
    $file = fopen($filename, 'w');
    fwrite($file, $xml->asXML());
    fclose($file);
?>