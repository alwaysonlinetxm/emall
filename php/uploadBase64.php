<?php
    session_start();
	
    $img = $_POST['img'];
	$url = $_POST['url'];

	$img = base64_decode($img);
	$state = file_put_contents($url, $img);
	if ($state){
	    echo '1';
	} else {
	    echo '0';
	}
?>