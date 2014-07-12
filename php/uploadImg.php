<?php
    session_start();
	
    if (is_uploaded_file($_FILES['upload']['tmp_name'])){
	    $result = move_uploaded_file($_FILES['upload']['tmp_name'],"../images/cover/".$_GET['gid'].".jpg");
	    if ($result == 1){
			echo "<script>window.parent.location.reload(true)</script>";
		} else {
		    echo "<script>window.parent.uploadError(".$_FILES['upload']['error'].")</script>";
		}
	} else {
	    echo "<script>window.parent.uploadError(".$_FILES['upload']['error'].")</script>";
	}
?>