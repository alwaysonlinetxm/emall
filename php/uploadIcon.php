<?php
    session_start();
	
    if (is_uploaded_file($_FILES['upload']['tmp_name'])){
	    $result = move_uploaded_file($_FILES['upload']['tmp_name'],"../images/icons/icon".$_SESSION['uid'].".png");
	    if ($result == 1){
			echo "<script>window.parent.uploadSucc()</script>";
		} else {
		    echo "<script>window.parent.uploadFail(".$_FILES['upload']['error'].")</script>";
		}
	} else {
	    echo "<script>window.parent.uploadFail(".$_FILES['upload']['error'].")</script>";
	}
?>