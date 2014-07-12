//建立全局连接变量
var ajaxReq = new AjaxRequest();
//提示内容
var TIPS = {
    uname: "必填，2-15字符，支持汉字、字母、数字及_",
	unameBlank: "用户名不能为空",
	unameTip: "输入格式有误，2-15字符，支持汉字、字母、数字及_",
	unamePass: "该用户名可用",
	pword: "必填，不得少于6位",
	pwordBlank: "密码不能为空",
	pwordTip: "密码不得少于6位",
	pwordPass: "密码可用",
	repass: "必填，重复上述密码",
	repassBlank: "请重复密码",
	repassTip: "密码不一致",
	repassPass: "密码无误",
	email: "必填",
	emailBlank: "邮箱不能为空",
	emailTip: "email格式不正确",
	emailPass: "邮箱可用",
	oldPword: "必填，输入旧密码",
	oldPwordBlank: "请输入旧密码",
	oldPwordTip: "密码不正确",
	oldPwordPass: "密码正确"
}
//暂存用户信息的全局变量
var userInfo = {};
//收藏项缓存数组
var colls = new Array();
//地址信息类
function Address(aid, aperson, aregion, astreet, apost, amobile, adefault){
	this.aid = aid;
	this.aperson = aperson;
	this.aregion = aregion;
	this.astreet = astreet;
	this.apost = apost;
	this.amobile = amobile;
	this.adefault = adefault;
}
//订单信息类
function Bill(bid, gid, gdis, gprice, gfare, gnum, bstatus, btime){
	this.bid = bid;
	this.gid = gid;
	this.gdis = gdis;
	this.gprice = gprice;
	this.gfare = gfare;
	this.gnum = gnum;
	this.bstatus = bstatus;
	this.btime = btime;
}

/** ------------------------ 注册 ------------------------- */
//初始化注册表单, 参数是将要进行检验的表单元素的父元素
function initRegForm(id){ 
	var inputs = $("#"+id).getElementsByClassName("reg-input");
	for (var i = 0; i < inputs.length; i++){
		//更改输入内容
		inputs[i].onfocus = function(event){
            var name = event.target.name;
            $("#reg-"+name+"Tip").innerHTML = TIPS[name];
	        $("#reg-"+name+"Tip").style.cssText = "color: #bbb";	
        };
	    inputs[i].onblur = function(event){ 
            var check;
            var str = event.target.value;
			var name = event.target.name;
            //未输入则返回, userInfo[name]在编辑用户信息时使用
	        if (str === "" || str == userInfo[name]) return;
	        //检查输入内容是否匹配
			switch (name){
			    case "uname": check = str.match(/^[\w\u4e00-\u9fa5]{2,15}$/); //\u4e00-\u9fa5 中文的匹配
				    break;
				case "pword": check = str.length >= 6;
				    if ($("#reg-repass").value != "" && $("#reg-repass").value != $("#reg-pword").value){
					    $("#reg-repassTip").innerHTML = TIPS["repassTip"];
	                    $("#reg-repassTip").style.cssText = "color:#f00;padding:3px;";
					}
				    break;
				case "repass":   check = str === $("#reg-pword").value;
				    break;
				case "email":    check = str.match(/^[_.0-9a-z-]+@([0-9a-z][0-9a-z-]+.)+[a-z]{2,3}$/);
				    break;
				case "oldPword": check = str === userInfo.pword;
				    break;
			};
			if (!check){ 
		        $("#reg-"+name+"Tip").innerHTML = TIPS[name+"Tip"];
	            $("#reg-"+name+"Tip").style.cssText = "color:#f00; padding:3px;";
	        } else if (name == "uname"){ //查询用户名是否已经存在
			    var url = "../php/name.php?uname="+str;
				url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
                ajaxReq.send("GET", url, true, function(){nameHandler("#reg-unameTip");}, "application/x-www-form-urlencoded; charset=UTF-8");
				$("#reg-unameTip").innerHTML = "<img src='../images/wait01.gif' />正在查询用户名..."
			} else {
			    $("#reg-"+name+"Tip").innerHTML = TIPS[name+"Pass"];
	            $("#reg-"+name+"Tip").style.cssText = "color: #69e850";
			}
        };
	}
	//重置处理
	$("#reg-reset").onclick = function(){
		for (var i = 0; i < inputs.length; i++){
			var name = inputs[i].name;
			$("#reg-"+name+"Tip").innerHTML = TIPS[name];
	        $("#reg-"+name+"Tip").style.cssText = "color: #bbb";
		}
	}
}

//查询用户名回调函数, 参数是显示查询结果元素的id
function nameHandler(id){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0,1);
		if (state == "1"){
		    $(id).innerHTML = "该用户名已存在!";
	        $(id).style.cssText = "color:#f00;padding:3px;";
		} else {
		    $(id).innerHTML = TIPS["unamePass"];
		    $(id).style.cssText = "color:#69e850";			
		}
	}
}

//注册
function register(){
	var pass = true;
	var inputs = $(".reg-input");

	for (var i = 0; i < inputs.length; i++){
	    var name = inputs[i].name;
		var value = inputs[i].value;
	    if (value == ""){  //判断是否空值
		    pass = false;
		    $("#reg-"+name+"Tip").innerHTML = TIPS[name+"Blank"];
			$("#reg-"+name+"Tip").style.cssText = "color:#f00;padding:3px;";
		}
		if ($("#reg-"+name+"Tip").innerHTML != TIPS[name+"Pass"]) pass = false;  //提示内容不正确时返回
	}
	if (!pass) return;
	
	//准备提交数据，先保存用户名密码
	sessionStorage.setItem("uname", $("#reg-uname").value);
	sessionStorage.setItem("pword", $("#reg-pword").value);
	
	var data = "uname=" + $("#reg-uname").value + "&pword=" + $("#reg-pword").value + "&email=" + $("#reg-email").value;
	//提交注册数据 application/x-www-form-urlencoded 说明数据是按键值对传送的
	ajaxReq.send("POST", "../php/register.php", true, registerHandler, "application/x-www-form-urlencoded; charset=UTF-8", data);
	$('.reg-content')[0].innerHTML = "<div style='margin:100px auto;width:76px'><img src='../images/wait03.gif'></div>";
}

//注册回调函数
function registerHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0,1);
		//显示结果的部分
		var result = document.createElement("div");
	    result.className = "reg-result";
		if (state == "1"){  //注册成功
		    $('.reg-content')[0].innerHTML = "<div style='margin:100px auto;width:440px;' class='com-succTip'><img src='../images/succ.png' class='com-imgTip'>注册成功！点击<a href='../index.html'>此处</a>返回主页，5秒钟后自动跳转。</div>";
			if (sessionStorage.getItem("uname") != null){ sessionStorage.setItem("uid", str.slice(1)); }//记录用户ID
			setTimeout(function(){ window.location = "../index.html";}, 5000);
		} else {
		    $('.reg-content')[0].innerHTML = "<div style='margin:100px auto;width:330px;' class='com-failTip'><img src='../images/fail.png' class='com-imgTip'>抱歉，注册失败，请刷新页面重试。</div>";
			sessionStorage.removeItem("uname"); //移除之前保存的用户名及密码
			sessionStorage.removeItem("pword");
		}
	}
}

/** ------------------------ 登陆 ------------------------- */
function initLoginForm(){
	var inputs = $(".login-input");

	for (var i = 0; i < inputs.length; i++){
		inputs[i].onfocus = function(){ $("#login-tip").innerHTML = ""; }
	}
}

function login(){
	var pass = true;
    var inputs = $(".login-input");
	//检测是否有内容为空
	for (var i = 0; i < inputs.length; i++){ 
		if (inputs[i].value == ""){ 
			$("#login-tip").innerHTML = "内容不能为空!";
			pass = false; 
			break;
		}
	}
	if (!pass) return;
    //选择自动登录
	if ($("#login-rem").checked){
		localStorage.setItem("uname", $("#login-uname").value);
	    localStorage.setItem("pword", $("#login-pword").value);	
		sessionStorage.setItem("isLogin", "true");
	} else {
		sessionStorage.setItem("uname", $("#login-uname").value);
	    sessionStorage.setItem("pword", $("#login-pword").value);
	}
    var url = "../php/login.php?uname=" + $("#login-uname").value + "&pword=" + $("#login-pword").value;
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
	ajaxReq.send("GET", url, true, loginHandler, "application/x-www-form-urlencoded; charset=UTF-8");
	$("#login-ing").style.display = "block";
}

//登陆回调函数
function loginHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0,1);
		if (state == "1"){  //登陆成功
		    sessionStorage.setItem("uid", str.slice(1)); //记录用户ID	
			setTimeout(function(){history.back(-1);}, 0);
		} else {
		    $("#login-tip").innerHTML = "登陆失败，请核对用户名及密码";
			$("#login-ing").style.display = "none";
			sessionStorage.removeItem("username");  //移除之前保存的用户名及密码
			sessionStorage.removeItem("paswword");
			sessionStorage.removeItem("isLogin");
			localStorage.removeItem("username");
			localStorage.removeItem("paswword");
		}
	}
}

/** ------------------------ 初始化登陆(自动登录) ------------------------- */
function initLogin(){
	if (localStorage.getItem("uname") != null && sessionStorage.getItem("isLogin") != "true"){  //自动登录
	    autoLogin();
	} else {
	    var name = getName();
	    if (name != null){ stateChange(true, name); }
    }
	//初始化购物车
	initCart();
}

//自动登录
function autoLogin(){
    var url = PATH+"php/login.php?uname="+localStorage.getItem("uname")+"&pword="+localStorage.getItem("pword");
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
	ajaxReq.send("GET", url, false, autoLoginHandler, "application/x-www-form-urlencoded; charset=UTF-8");
}

//自动登录回调
function autoLoginHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0,1);
		if (state == "1"){  //登陆成功
		    sessionStorage.setItem("uid", str.slice(1)); //记录用户ID
		    sessionStorage.setItem("isLogin", "true");
			stateChange(true, localStorage.getItem("uname"));
		} else {
		    alert("自动登录失败");
		}
	}
}

/** ------------------------ 注销 ------------------------- */
function logout(){	
    var url = PATH+"php/logout.php?action=logout";
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
    ajaxReq.send("GET", url, true, logoutHandler, "application/x-www-form-urlencoded; charset=UTF-8");
}

function logoutHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0,1);
		if (state == "1"){  //注销成功
			stateChange(false); //更换状态
			window.location = PATH+"html/login.html";
		} 
	}
}

//更换状态
function stateChange(login, name){
    if (login){  //如果是要转为登陆状态
		$(".com-nav-wel")[0].innerHTML = "欢迎您，" + name + "! &nbsp;&nbsp;&nbsp;&nbsp;[<a class='com-nav-user' onclick='logout()'>注销</a>]";
	} else {
	    localStorage.removeItem("uname");
		localStorage.removeItem("pword");
		sessionStorage.removeItem("uname");
		sessionStorage.removeItem("pword");
		sessionStorage.removeItem("uid"); //移除用户ID
		$(".com-nav-wel")[0].innerHTML = "欢迎您! <a class='com-nav-user' href='"+PATH+"html/login.html'>请登录</a><a class='com-nav-user' href='"+PATH+"html/register.html'>免费注册</a>";
	}
}

/** ------------------------ 用户信息 ------------------------- */
function initUserAction(){
	if (checkLogin()){
		var name = getName();
		$(".user-name")[0].innerHTML = name; 
		$("#user-icon").src = PATH+"images/icons/icon"+sessionStorage.getItem("uid")+".png?ver="+Math.random();
	}
	var action = window.location.search.slice(1);

	switch(action){
		case "none":
			break;
		case "coll": $("#user-act-coll").click();
			break;
		case "address": $("#user-act-address").click();
			break;
		case "bill": $("#user-act-bill").click();
			break;
	}
	getRecom(encodeURI(encodeURI("../php/getRecom.php?num=3")));//获取推荐项
}

//显示相关页面
function showLi(id){
	var li = $(".user-show")[0].getElementsByTagName("li");
	for (var i = 0; i < li.length; i++) { li[i].style.display = "none"; }
	$("#"+id).style.display = "block";
}

//恢复默认提示
function restoreTip(id){
	var inputs = $("#"+id).getElementsByClassName("reg-input");
	for (var i = 0; i < inputs.length; i++){ 
		var name = inputs[i].name;
		inputs[i].value = ""; 
		$("#reg-"+name+"Tip").innerHTML = TIPS[name];
		$("#reg-"+name+"Tip").style.cssText = "color:#bbb;padding:3px;";
	}
}

//编辑用户信息
function loadInfo(id){
	showLi(id);
	restoreTip(id);//恢复默认提示
	userInfo.uname = getName();
	if (userInfo.uname != null){
	    userInfo.pword = sessionStorage.getItem("pword") || localStorage.getItem("pword");	
        var url = PATH+"php/userInfo.php?uname=" + userInfo.uname;
	    url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
        ajaxReq.send("GET", url, true, userInfoHandler, "application/x-www-form-urlencoded; charset=UTF-8"); 
	}
}

//处理取回的信息
function userInfoHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0, 1);
		if (state == "1"){
			var arr = new Array();
			arr = str.slice(1).split('&');
			userInfo.email = arr[0]; //记录各项信息
	
			for (var key in userInfo){
				var item = $("#reg-"+key);
				if (item != null && key != "password"){
					item.value = userInfo[key];
				}
			}
		}
		initRegForm("user-editInfo");
	}	
}

//保存修改数据
function saveInfo(){
	var uid = sessionStorage.getItem("uid") || localStorage.getItem("uid");
	var data = "type=info&uid=" + uid; //原用户名
    var pass = true;
	var alter = false;
	var inputs = $("#user-editInfo").getElementsByClassName("reg-input");

	for (var i = 0; i < inputs.length; i++){
	    var name = inputs[i].name;
		var value = inputs[i].value;
		//检测是否为空值
		if (value == ""){
		    $("#reg-"+name+"Tip").innerHTML = TIPS[name+"Blank"];
			$("#reg-"+name+"Tip").style.cssText = "color:#f00;padding:3px;";
		}
		//判断是否修改
		if (value != userInfo[name]){
		    data = data + "&" + name + "=" + value;
		    alter = true;
		} else {
			data = data + "&" + name + "=" + "";
		}
        //判断值是否符合要求
        if ($("#reg-"+name+"Tip").innerHTML != TIPS[name+"Pass"] && $("#reg-"+name+"Tip").innerHTML != TIPS[name]) 
			pass = false;  //提示内容不正确时返回		
	}
	if (!pass) return;
	//如果没有数据被修改
	if(!alter){
		$('.user-cont-middle')[0].innerHTML = "<div style='margin:60px auto;width:250px;' class='com-succTip'><img src='../images/succ.png' class='com-imgTip'>编辑成功！2秒钟后自动刷新。</div>";
		setTimeout(function(){ window.location.reload(true); }, 2000); //刷新
		return;
	}	
	//准备提交数据，先保存用户名
	if (sessionStorage.getItem("uname") != null){
	    sessionStorage.setItem("uname", $("#reg-uname").value);
	} else {
	    localStorage.setItem("uname", $("#reg-uname").value);
	}
	//提交注册数据 application/x-www-form-urlencoded 说明数据是按键值对传送的
	ajaxReq.send("POST",PATH+"php/update.php",true,updateHandler,"application/x-www-form-urlencoded; charset=UTF-8",data);
	$('#user-cont-middle').innerHTML = "<div style='margin:60px auto;width:71px'><img src='"+PATH+"images/wait03.gif'></div>"; 
}

//修改密码
function alterPword(id){
	showLi(id);
	restoreTip(id);//恢复默认提示
	userInfo.pword = sessionStorage.getItem("pword") || localStorage.getItem("pword");
	initRegForm("user-alterPword");
}

//保存密码
function savePword(){
	var uid = sessionStorage.getItem("uid") || localStorage.getItem("uid");
	var data = "type=pass&uid=" + uid; //原用户名
    var pass = true;
	var alter = false;
	var inputs = $("#user-alterPword").getElementsByClassName("reg-input");

	for (var i = 0; i < inputs.length; i++){
	    var name = inputs[i].name;
		var value = inputs[i].value;
		//检测是否为空值
		if (value == ""){
		    $("#reg-"+name+"Tip").innerHTML = TIPS[name+"Blank"];
			$("#reg-"+name+"Tip").style.cssText = "color:#f00;padding:3px;";
		}
		//判断是否修改
		if (name == "pword"){
			if (value != userInfo[name]){
				data = data + "&" + name + "=" + value;
				alter = true;
			} else {
				data = data + "&" + name + "=" + "";
			}
		}
        //判断值是否符合要求
        if ($("#reg-"+name+"Tip").innerHTML != TIPS[name+"Pass"] && $("#reg-"+name+"Tip").innerHTML != TIPS[name]) 
			pass = false;  //提示内容不正确时返回		
	}
	if (!pass) return;
	//如果没有数据被修改
	if(!alter){
		$('.user-cont-middle')[0].innerHTML = "<div style='margin:60px auto;width:250px;' class='com-succTip'><img src='../images/succ.png' class='com-imgTip'>更新成功！2秒钟后自动刷新。</div>";
		setTimeout(function(){ window.location.reload(true); }, 2000); //刷新
		return;
	}	
	//准备提交数据，先保存用户名
	if (sessionStorage.getItem("pword") != null){
	    sessionStorage.setItem("pword", $("#reg-pword").value);
	} else {
	    localStorage.setItem("pword", $("#reg-pword").value);
	}
	//提交注册数据 application/x-www-form-urlencoded 说明数据是按键值对传送的
	ajaxReq.send("POST",PATH+"php/update.php",true,updateHandler,"application/x-www-form-urlencoded; charset=UTF-8",data);
	$('#user-cont-middle').innerHTML = "<div style='margin:60px auto;width:71px'><img src='"+PATH+"images/wait03.gif'></div>";	
}

//更新回调函数
function updateHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		if (str == '1'){
		    $('.user-cont-middle')[0].innerHTML = "<div style='margin:60px auto;width:250px;' class='com-succTip'><img src='../images/succ.png' class='com-imgTip'>更新成功！2秒钟后自动刷新。</div>";
		} else {  //更新失败恢复为之前的用户名及密码
		    $('.user-cont-middle')[0].innerHTML = "<div style='margin:60px auto;width:250px;' class='com-succTip'><img src='../images/fail.png' class='com-imgTip'>更新失败！2秒钟后自动刷新。</div>";
		    if (sessionStorage.getItem("uname") != null){
	            sessionStorage.setItem("uname", userInfo.uname);
	            sessionStorage.setItem("pword", userInfo.pword);
	        } else {
			    localStorage.setItem("uname", userInfo.uname);
	            localStorage.setItem("pword", userInfo.pword);
		    }
		}
		setTimeout(function(){ window.location.reload(true); }, 2000); //刷新
	}
}

//选择头像
function chooseIcon(id){
	showLi(id);
	
	$("#user-saveIcon").onclick = function(){
		submitIcon("../images/icons/icon"+sessionStorage.getItem("uid")+".png");
	}
	
	if (TFunc.browser() == "MSIE"){   //根据浏览器来设置file样式
	    $("#user-upload").className = "user-upload";
	} else {
	    $("#user-upload").style.cssText = "display: none";
	}
}

/** ------------------------ 查看收藏 ------------------------- */
//显示收藏界面 并获取收藏信息
function getColl(id){
	showLi(id);
	$(".user-colls")[0].innerHTML = ""; //先清空之前的数据
	//获取收藏数据
	var url = "../php/goodsGet.php?type=coll&uid="+sessionStorage.getItem("uid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){getXMLHandler(collHandler);}, "application/x-www-form-urlencoded; charset=UTF-8");
}

//处理xml文件，生成节点
function collHandler(){
    if (ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReq.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (goods.length) goods.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {gid:"gid", gdis:"gdis", gprice:"gprice", gfare:"gfare"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				goods.push(new Goods(item["gid"],item["gdis"],item["gprice"],item["gfare"]));
			}
			showColl();
		} else {
			$(".user-colls")[0].innerHTML = "抱歉，您目前还没有收藏";
		}
	}
}

//显示收藏项
function showColl(){
	$(".com-number")[0].innerHTML = goods.length; //设置收藏数量
	for (var i = 0; i < goods.length; i++){
		var li = document.createElement("li");
		li.className = "user-coll-item";
		$(".user-colls")[0].appendChild(li);
		addGoodsShow(li, goods[i].gid, goods[i].gdis, goods[i].gprice, goods[i].gfare);
		var p = document.createElement("p");
		li.appendChild(p);
		p.className = "user-coll-edit TClearfix";
		var cart = document.createElement("a");
		cart.className = "user-coll-cart";
		cart.onclick = (function(gid){ 
			return function(){
				addGoods("cart", gid, "成功添加！已将该商品加入您的购物车。", "该商品已在您的购物车中了。");
			};
		})(goods[i].gid);
		p.appendChild(cart);
		var dele = document.createElement("a");
		dele.className = "user-coll-delete";
		dele.onclick = function(e){
			deleGoods("coll", e.target.parentNode.parentNode.getElementsByTagName("a")[0].name, deleCollHandler);
		}
		p.appendChild(dele);		
	}
}

//删除收藏回调函数
function deleCollHandler(){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
		var str = ajaxReq.getResponseText().Trim();
		if (str == 1){
			window.location.href = "user.html?coll";
		} else {
			$(".com-black-container")[0].innerHTML = "<p class='user-dele-text'>删除失败，请刷新重试。</p>";
		}
	}
}

/** ------------------------ 收货地址管理 ------------------------- */
function addressEdit(id){
	showLi(id);
	//获取收藏数据
	var url = "../php/getAddress.php?uid="+sessionStorage.getItem("uid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ getXMLHandler(function(){addressHandler(showAddress); }); }, "application/x-www-form-urlencoded; charset=UTF-8");
	//省市区选择控件初始化
	address = new TAddress($('#com-province'), $('#com-city'), $('#com-area'));
}

//获取地址回调函数
function addressHandler(succ, fail){
	if (ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReq.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (goods.length) goods.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {aid:"aid", aperson:"aperson", aregion:"aregion", astreet:"astreet", apost:"apost", amobile:"amobile", adefault:"adefault"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				goods.push(new Address(item["aid"],item["aperson"],item["aregion"],item["astreet"],item["apost"],item["amobile"],item["adefault"]));
			}
			if (succ != undefined ){ succ(); }  //显示已有地址
		} else {
			if (fail != undefined ){ fail(); }  //没有数据时调用的函数
		}		
	}
}

//显示已有地址
function showAddress(){
	$(".user-address-num")[0].innerHTML = goods.length;
	var tr = $(".user-address-table")[0].getElementsByTagName("tr"); 
	while (tr.length > 1) $(".user-address-table")[0].removeChild(tr[1]); //先清空之前的数据
	for (var i = 0; i < goods.length; i++){		
		var tr = document.createElement("tr");
		tr.className = "com-table-item";
		$(".user-address-table")[0].appendChild(tr);
		for (var key in goods[i]){
			if (key != "aid" && key != "adefault"){
				var td = document.createElement("td");
				td.innerHTML = goods[i][key];
				tr.appendChild(td);
			}
		}
		//操作
		td = document.createElement("td");
		td.id = goods[i].adefault + goods[i].aid;  //将地址ID和默认标记作为父td元素的ID存起来
		td.innerHTML = "<a class='user-address-edit'>修改</a> <a class='user-address-dele'>删除</a> ";
		if (goods[i].adefault == "1"){
			td.innerHTML += "<a style='color:#00f'>默认地址</a>";
			tr.style.background = "#cde2f5"
		} else {
			td.innerHTML += "<a class='user-address-default'>设为默认</a>";
		}
		td.getElementsByClassName("user-address-edit")[0].onclick = function(e){
			editID = e.target.parentNode.id.slice(1); //记录本次修改的地址ID
			var items = e.target.parentNode.parentNode.getElementsByTagName("td");
			$(".com-address-person")[0].value = items[0].innerHTML;
			var regions = items[1].innerHTML.split(" ");
			address = new TAddress($('#com-province'), $('#com-city'), $('#com-area'), regions[0], regions[1], regions[2]);
			$(".com-address-street")[0].value = items[2].innerHTML;
			$(".com-address-post")[0].value = items[3].innerHTML;
			$(".com-address-mobile")[0].value = items[4].innerHTML;
		}
		td.getElementsByClassName("user-address-dele")[0].onclick = function(e){
			var sure = showMakeSure("您确定要删除该地址么？");
			sure.onclick = function(){ 
				var url = "../php/editAddress.php?type=dele&aid="+e.target.parentNode.id.slice(1)+"&uid="+sessionStorage.getItem("uid");
				url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
				ajaxReq.send("GET", url, true, function(){ resultHandler("地址删除成功！", "抱歉，删除失败，请刷新重试。", "user.html?address"); }, "application/x-www-form-urlencoded; charset=UTF-8");
			}
		}
		var adefault = td.getElementsByClassName("user-address-default")[0];
		if (adefault != undefined){
			td.getElementsByClassName("user-address-default")[0].onclick = function(e){
				setDefaultAddress(e.target.parentNode.id.slice(1), "user.html?address");
			}
		}
		tr.appendChild(td);		
	}
}

/** ------------------------ 我的订单 ------------------------- */
function getBill(id){
	showLi(id);
	//获取订单数据
	var url = "../php/getBill.php?uid="+sessionStorage.getItem("uid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ getXMLHandler(billHandler); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//获取订单回调函数
function billHandler(){
	if (ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReq.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (goods.length) goods.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {bid:"bid", gid:"gid", gdis:"gdis", gprice:"gprice", gfare:"gfare", gnum:"gnum", bstatus:"bstatus", btime:"btime"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				goods.push(new Bill(item["bid"],item["gid"],item["gdis"],item["gprice"],item["gfare"],item["gnum"],item["bstatus"],item["btime"]));
			}
			showBill();  //显示已有订单
		} 	
	}
}

//显示订单
function showBill(){
	$(".user-bill-num")[0].innerHTML = goods.length;
	var tr = $(".user-bill-table")[0].getElementsByTagName("tr"); 
	while (tr.length > 1) $(".user-bill-table")[0].removeChild(tr[1]); //先清空之前的数据
	for (var i = 0; i < goods.length; i++){
		//订单号 成交时间
		var p = document.createElement("tr");
		p.className = "user-bill-info";
		p.innerHTML = "订单编号：" + goods[i].bid + "&nbsp;&nbsp;&nbsp;&nbsp;成交时间：" + goods[i].btime;
		$(".user-bill-table")[0].appendChild(p);
		
		var tr = document.createElement("tr");
		tr.className = "com-table-item";
		$(".user-bill-table")[0].appendChild(tr);
		//商品
		td = document.createElement("td");
		//td.className = "cart-goods";
		tr.appendChild(td);
		var a = document.createElement("a");
		a.className = "com-cart-infoa";
		a.name = goods[i].gid;
		a.onclick = (function(str){
			return function(){
				window.open(PATH+"html/showGoods.html?"+str);
			}
		})(a.name);
		td.appendChild(a);
		var img = document.createElement("img");
		img.className = "com-cart-img";
		img.src = "../images/cover/"+goods[i].gid+".jpg";
		a.appendChild(img);
		var span = document.createElement("span");
		span.className = "com-cart-infodis";
		span.innerHTML = goods[i].gdis;
		a.appendChild(span);
		//单价
		td = document.createElement("td");
		td.innerHTML = (goods[i].gprice*1).toFixed(2);
		tr.appendChild(td);
		//数量 
		td = document.createElement("td");
		td.innerHTML = goods[i].gnum
		tr.appendChild(td);
		//运费
		td = document.createElement("td");
		td.innerHTML = (goods[i].gfare*1).toFixed(2);
		tr.appendChild(td);
		//小计
		td = document.createElement("td");
		td.className = "cart-part";
		td.innerHTML = (goods[i].gprice*goods[i].gnum+goods[i].gfare*1).toFixed(2);
		tr.appendChild(td);
		//状态
		td = document.createElement("td");
		td.innerHTML = goods[i].bstatus;
		tr.appendChild(td);
		//操作
		td = document.createElement("td");
		tr.appendChild(td);
		var eval = document.createElement("p")
		eval.innerHTML = "评论";
		eval.className = "user-bill-operation";
		eval.onclick = (function(gid, gdis){ 
			return function(){
				window.location.href = "eval.html?" + gid + "&" + gdis;
			}
		})(a.name, goods[i].gdis);
		td.appendChild(eval);
		var dele = document.createElement("p")
		dele.innerHTML = "取消";
		dele.className = "user-bill-operation";
		dele.onclick = (function(bid){ 
			return function(){
				var sure = showMakeSure("您确认要取消该订单么？");
				sure.onclick = function(){ 
					var url = "../php/deleBill.php?bid="+bid;
					url = encodeURI(encodeURI(url));//编码，避免传送时乱码
					ajaxReq.send("GET", url, true, function(){ resultHandler("订单已成功取消！", "抱歉，取消失败，请刷新重试。", "user.html?bill"); }, "application/x-www-form-urlencoded; charset=UTF-8");
				}
			}
		})(goods[i].bid);
		td.appendChild(dele);
		var pay = document.createElement("p")
		pay.innerHTML = "支付";
		pay.className = "user-bill-operation";
		td.appendChild(pay);
	}
}