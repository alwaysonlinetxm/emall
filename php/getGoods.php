<?php
    session_start();//开始一个会话或维持当前会话
	
    $tag = explode('|', urldecode($_GET['tag']));
    $dis = explode(' ', urldecode($_GET['dis']));

	$filename = "../xml/data.xml";
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
	$query = "select gid, gdis, gprice, gfare, gsale, gplace from goods where";
	for ($i = 0; $i < count($tag)-1; $i++){
		$query = $query." gtype like '%$tag[$i]%' and";
	}
	if ($tag[count($tag)-1] != ""){ $query = $query." gtype like '%".$tag[count($tag)-1]."%'"; }
	if ($tag[0] != "") { $query .= " and"; }
	for ($i = 0; $i < count($dis)-1; $i++){
		if ($dis[$i] != "")$query = $query." gdis like '%$dis[$i]%' and";
	}
	$query = $query." gdis like '%".$dis[count($dis)-1]."%'"; 
	//echo $query;
	$check_query = $mysqli->query($query);
	while ($result = $check_query->fetch_array()){
        $entry = $xml->entries->addChild("entry");
		$entry->addChild("gid", $result['gid']);
		//addChild 方法中的第二个参数中，不能带有 & 这个符号(旧版本) 所以要间接赋值
		$entry->addChild("gdis", "");
		$entry->gdis = $result['gdis'];
		$entry->addChild("gprice", $result['gprice']);
		$entry->addChild("gfare", $result['gfare']);
		$entry->addChild("gsale", $result['gsale']);
		$entry->addChild("gplace", $result['gplace']);
    } 
	echo $xml;	
    //写入数据
    $file = fopen($filename, 'w');
    fwrite($file, $xml->asXML());
    fclose($file);
?>