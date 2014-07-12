//剪切图片的对象
var imgClip = new TImgClip(450.0, 160.0, $("#user-iconPreview"), $("#user-iconClip"));

//将提示信息复原
function iconTipRestore(){
    $("#user-iconTip").innerHTML = "支持jpg，png，gif格式，小于1M..";
	$("#user-iconTip").style.color = "#999";
}

//将点击传递给file
function transClick(){
    iconTipRestore();
    /* if (TFunc.browser() != "MSIE")  */$("#user-upload").click();
}

//更新文件内容
function imgChange(file){
    $("#user-file").value = (document.uploadForm.upload.value);
	if (!TFunc.checkFileType($("#user-file").value, ["jpg", "png", "gif", "jpeg"])){
	    $("#user-iconTip").innerHTML = "文件格式不符！支持jpg，png，gif格式，小于1M..";
		$("#user-iconTip").style.color = "#f00";
		return;
	}
	//普通上传可用
	$("#user-formSave").disabled = false;
	//先检测是否支持canvas和FileReader
	if (!TFunc.isCanvasEnable() || window.FileReader == undefined){
	    showSorry();
		return;
	}
	//裁剪上传可用
	$("#user-saveIcon").disabled = false;
	//导入裁剪组件
	imgClip.loadImg(file);
}

//不支持预览时显示的画面
function showSorry(){
    $("#user-uploadForm").removeChild($("#user-iconPreview"));
	var tip = document.createElement("div");
	tip.id = "user-iconPreview";
	tip.innerHTML = "<p style='color:#f00;margin:100px auto;width:300px;'><img src='../images/fail.png'>抱歉, 检测到您的浏览器不支持预览, 您可能无法使用裁剪功能, 您可以通过普通上传直接上传图片..</p>";
	$("#user-uploadForm").insertBefore(tip, $("#user-iconClip"));
}

//传送裁剪图片 参数是图片将要保存的位置
function submitIcon(url){
    /* var data = $("#user-iconClip").toDataURL(); 
    //删除字符串前的提示信息 "data:image/png;base64," 	
    data = data.substring(22);
	//将base64码里的“+”号改成"%2B"和“&”改成"%26" 因为在ajax传送时会把他们变成空格 毁坏了数据的正确性
	data = data.replace(/\&/g,"%26");
    data = data.replace(/\+/g,"%2B"); */
	var data = imgClip.toBase64();
	ajaxReq.send("POST", PATH+"php/uploadBase64.php", true, uploadBaseHandler, "application/x-www-form-urlencoded; charset=UTF-8", "img="+data+"&url="+url);
}

//传送裁剪图片会掉函数
function uploadBaseHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0,1);
		if (state == '1'){
		    uploadSucc();
		} else {
		    uploadFail(state);
		}
	}
}

//上传成功回调函数
function uploadSucc(){
    $('.user-cont-middle')[0].innerHTML = "<div style='margin:60px auto;width:250px;' class='com-succTip'><img src='../images/succ.png' class='com-imgTip'>上传成功！2秒钟后自动刷新。</div>";
	setTimeout(function(){ window.location.reload(true); }, 2000); //刷新
}

//上传失败回调函数
function uploadFail(state){
	$('.user-cont-middle')[0].innerHTML = "<div style='margin:60px auto;width:380px;' class='com-succTip'><img src='../images/fail.png' class='com-imgTip'>上传失败！错误状态码: "+state+"，2秒钟后自动刷新。</div>";
	setTimeout(function(){ window.location.reload(true); }, 2000); //刷新
}