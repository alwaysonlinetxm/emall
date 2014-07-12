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
	$query = "select aid, aperson, aregion, astreet, apost, amobile, adefault from address where uid=$uid";
	$check_query = $mysqli->query($query);
	while ($result = $check_query->fetch_array()){
        $entry = $xml->entries->addChild("entry");
		$entry->addChild("aid", $result['aid']);
		$entry->addChild("aperson", $result['aperson']);
		$entry->addChild("aregion", $result['aregion']);
		$entry->addChild("astreet", $result['astreet']);
		$entry->addChild("apost", $result['apost']);
		$entry->addChild("amobile", $result['amobile']);
		$entry->addChild("adefault", $result['adefault']);
    } 
	echo $xml;	
    //写入数据
    $file = fopen($filename, 'w');
    fwrite($file, $xml->asXML());
    fclose($file);
?>