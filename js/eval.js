//初始化评论界面
function initEval(){
	//获取所要评论的商品ID和描述
	var info = decodeURI(window.location.search.slice(1)).split("&");
	$("#eval-goods-img").src = "../images/cover/" + info[0] + ".jpg";
	$("#eval-goods-dis").innerHTML = info[1];
	$(".eval-goods")[0].onclick = function(){
		window.open(PATH+"html/showGoods.html?"+info[0]);
	}
	$(".eval-textarea")[0].value = "";//清空评论内容
	//提交评论
	$("#eval-submit-button").onclick = function(){
		if ($(".eval-textarea")[0].value == ""){ 
			$(".eval-numTip")[0].innerHTML = "内容不能为空！";
			$(".eval-numTip")[0].style.color = "#f00";
			return;
		}
		var color = TFunc.getStyle($(".eval-numTip")[0]).color;
		if (color == "#f00" || color == "#ff000000" || color == "rgb(255, 0, 0)"){ return; }
		var url = "../php/getAddress.php";
		var data = "uid=" + sessionStorage.getItem("uid") + "&gid=" + info[0] + "&cont=" + $(".eval-textarea")[0].value + "&time=" + (new Date()).shortFormat() + "&grade=";
		var radio = document.getElementsByName("eval-grade");
		for (var i = 0; i < radio.length; i++){
			if (radio[i].checked){ data += radio[i].value; }
		}
		ajaxReq.send("POST", "../php/submitEval.php", true, addEvalHandler, "application/x-www-form-urlencoded; charset=UTF-8", data);
		$(".eval-content")[0].innerHTML = "<div style='margin:60px auto;width:71px'><img src='../images/wait03.gif'></div>";
	}
	getRecom(encodeURI(encodeURI("../php/getRecom.php?num=4")));//获取推荐项
}

//添加评论回调函数
function addEvalHandler(){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
		var str = ajaxReq.getResponseText().Trim();
		if (str == 1){
			$(".eval-content")[0].innerHTML = "<div style='margin:60px auto;width:250px;' class='com-succTip'><img src='../images/pass.png' /> 评论成功！</div>";
		} else {
			$(".eval-content")[0].innerHTML = "<div style='margin:60px auto;width:300px;' class='com-failTip'>抱歉，评论失败，请刷新重试。</div>";
		}
	}
}
