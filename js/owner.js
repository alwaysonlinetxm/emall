//建立全局连接变量
var ajaxReq = new AjaxRequest();
//信息缓存数组
var buff = new Array();
//商品信息缓存
var Info = new Array();
//每页显示的商品数
var NUM = 10;
//编辑类型 修改或是添加
var editType = "";
//商品信息类
function Goodsb(gid, gdis, gprice, gstock){
  this.gid = gid;
  this.gdis = gdis;
  this.gprice = gprice;
  this.gstock = gstock;
}
//订单信息类
function Billb(bid, gid, gdis, uname, gprice, gfare, gnum, bstatus, btime){
	this.bid = bid;
	this.gid = gid;
	this.gdis = gdis;
	this.uname = uname;
	this.gprice = gprice;
	this.gfare = gfare;
	this.gnum = gnum;
	this.bstatus = bstatus;
	this.btime = btime;
}
//获取xml信息回调函数
function getbXMLHandler(handler){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    ajaxReq.send("GET", "../xml/"+sessionStorage.getItem("oid")+"data.xml", true, handler);
	}
}

/** ------------------------ 登陆 ------------------------- */
function initLoginbForm(){
	var inputs = $(".login-input");

	for (var i = 0; i < inputs.length; i++){
		inputs[i].onfocus = function(){ $("#login-tip").innerHTML = ""; }
	}
}

function loginb(){
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

	sessionStorage.setItem("oid", $("#login-uname").value); //缓存商家ID
    var url = "../php/merchant/loginb.php?oid=" + $("#login-uname").value + "&opword=" + $("#login-pword").value;
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
	ajaxReq.send("GET", url, true, loginbHandler, "application/x-www-form-urlencoded; charset=UTF-8");
	$("#login-ing").style.display = "block";
}

//登陆回调函数
function loginbHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		if (str == "1"){  //登陆成功
		    window.location.href = "merchant.html?none";
		} else {
		    $("#login-tip").innerHTML = "登陆失败，请核对用户名及密码";
			$("#login-ing").style.display = "none";
			sessionStorage.removeItem("oid");  //移除之前保存的用户名及密码
		}
	}
}

/** ------------------------ 注销 ------------------------- */
function logoutb(){	
    var url = "../php/merchant/logoutb.php?action=logout";
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
    ajaxReq.send("GET", url, true, logoutbHandler, "application/x-www-form-urlencoded; charset=UTF-8");
}

function logoutbHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		if (str == "1"){  //注销成功
			sessionStorage.removeItem("oid");
			window.location.href = "login_b.html";
		} 
	}
}

/** ------------------------ 管理界面 ------------------------- */
function initMerchant(){
	var oid = sessionStorage.getItem("oid");
	if (oid == undefined){
		window.location.href = "login_b.html";
		return;
	} else {
		$(".merchant-oid")[0].innerHTML = oid;
	}
	var id = window.location.search.slice(1);
	//初始化界面
	if (id == "none"){
		$("#merchant-option-1").click();
	} else {
		$("#"+id).click();
	}
}

//显示相应面板 参数是面板ID 时间触发对象 以及要传给初始化函数的参数
function showContLi(id, target, gid){
	//隐藏分页组件
	$(".TPage02")[0].style.display = "none";
	var li = $(".merchant-content-li");
	for (var i = 0; i < li.length; i++){
		if (li[i].id == id){
			li[i].style.display = "block";
		} else {
			li[i].style.display = "none";
		}
	}
	//设置option背景
	li = target.parentNode.parentNode.getElementsByTagName("li");
	for (var i = 0; i < li.length; i++){
		if (li[i] == target.parentNode){
			li[i].className = "merchant-option-bg";
		} else {
			li[i].className = "";
		}
	}
	//初始化相应面板的内容
	switch (id){
		case "merchant-goods-list": initGoodsList();
			break;
		case "merchant-goods-add": initGoodsAdd(gid);
			break;
		case "merchant-bill-list": initBillList();
			break;
	}
}

//初始化商品信息表
function initGoodsList(){
	$(".TPage02")[0].style.display = "block";
	var url = "../php/merchant/getGoodsb.php?oid=" + sessionStorage.getItem("oid");
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
    ajaxReq.send("GET", url, true, function(){ getbXMLHandler(getGoodsbHandler); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//获取商品信息回调函数
function getGoodsbHandler(){
	if (ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReq.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (buff.length) buff.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {gid:"gid", gdis:"gdis", gprice:"gprice", gstock:"gstock"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				buff.push(new Goodsb(item["gid"],item["gdis"],item["gprice"],item["gstock"]));
			}
			$("#merchant-gnum").innerHTML = buff.length;
			new TPages($(".TPage02")[0], Math.ceil(buff.length/NUM), showGoodsb, 'TPage02-selected');
			showGoodsb(1); //显示商品信息
		} else {
		}		
	}
}

//显示商品信息 参数是待显示的页号数
function showGoodsb(n){
	//先清空之前的数据
	var tr = $(".merchant-goods-table")[0].getElementsByTagName("tr"); 
	while (tr.length > 1) $(".merchant-goods-table")[0].removeChild(tr[1]); 
	//计算终止项编号
	var end = n*NUM < buff.length ? n*NUM : buff.length;
	for (var i = (n-1)*NUM; i < end; i++){
		var tr = document.createElement("tr");
		tr.className = "com-table-item";
		$(".merchant-goods-table")[0].appendChild(tr);
		//商品编号
		var td = document.createElement("td");
		td.innerHTML = buff[i].gid;
		tr.appendChild(td);
		//商品
		td = document.createElement("td");
		tr.appendChild(td);
		var a = document.createElement("a");
		a.className = "com-cart-infoa";
		a.name = buff[i].gid;
		a.onclick = (function(str){
			return function(){
				window.open(PATH+"html/showGoods.html?"+str);
			}
		})(a.name);
		td.appendChild(a);
		var img = document.createElement("img");
		img.className = "com-cart-img";
		img.src = "../images/cover/"+buff[i].gid+".jpg";
		a.appendChild(img);
		var span = document.createElement("span");
		span.className = "com-cart-infodis";
		span.innerHTML = buff[i].gdis;
		a.appendChild(span);
		//单价
		td = document.createElement("td");
		td.innerHTML = (buff[i].gprice*1).toFixed(2);
		tr.appendChild(td);
		//库存 
		td = document.createElement("td");
		td.innerHTML = buff[i].gstock
		tr.appendChild(td);
		//操作
		td = document.createElement("td");
		tr.appendChild(td);
		var detail = document.createElement("p")
		detail.innerHTML = "查看商品";
		detail.className = "user-bill-operation";
		detail.onclick = (function(gid){ 
			return function(){
				showContLi("merchant-goods-add", $("#merchant-option-1"), gid)
			}
		})(a.name);
		td.appendChild(detail);
		var dele = document.createElement("p")
		dele.innerHTML = "下架";
		dele.className = "user-bill-operation";
		dele.onclick = (function(gid){ 
			return function(){
				var sure = showMakeSure("您确认要将该商品下架么？");
				sure.onclick = function(){ 
					var url = "../php/editGoods.php?type=dele&gid="+gid;
					url = encodeURI(encodeURI(url));//编码，避免传送时乱码
					ajaxReq.send("GET", url, true, function(){ resultHandler("商品已成功下架！", "抱歉，下架失败，请刷新重试。", "merchant.html?merchant-option-1"); }, "application/x-www-form-urlencoded; charset=UTF-8");
				}
			}
		})(buff[i].gid); 
		td.appendChild(dele);
	}
}

//初始化商品详情
function initGoodsAdd(gid){
	if (gid == undefined){
		$("#merchant-title2").innerHTML = "商&nbsp;品&nbsp;添&nbsp;加";
		$("#merchant-goods-num").style.display = "none";
		$("#merchant-upload").style.display = "none";
		$("#merchant-goods-img").src = "../images/cover/000000.jpg";
		editType = "add"; //编辑类型设为添加
	} else {
		$("#merchant-title2").innerHTML = "商&nbsp;品&nbsp;详&nbsp;情";
		$("#merchant-goods-num").style.display = "block";
		$("#merchant-upload").style.display = "inline-block";
		$("#merchant-goods-id").innerHTML = gid;
		$("#merchant-goods-img").src = "../images/cover/"+gid+".jpg";
		editType = "alter"; //编辑类型设为修改
		var url = "../php/goodsInfo.php?gid=" + gid;
		url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
		ajaxReq.send("GET", url, true, goodsDetaulHandler, "application/x-www-form-urlencoded; charset=UTF-8");
	}
	//隐藏上传图片组件
	$("#merchant-upload-img").style.display = "none";
	//城市选择控件
	address = new TAddress($("#merchant-goods-province"), $("#merchant-goods-city"));
	//保存按钮
	$("#merchant-goods-save").onclick = function(){
		saveGoodsInfo(gid);
	}
	//取消按钮
	$("#merchant-goods-cancel").onclick = function(){
		initGoodsForm(editType, Info);
	}
	//初始化表单
	initGoodsForm(editType);	
}

//商品详情回调函数
function goodsDetaulHandler(){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){ 
		var str = ajaxReq.getResponseText().Trim();
		if (str.slice(0, 1) == 1){
			str = str.slice(1);
			Info = str.split("|");
			initGoodsForm(editType, Info);
		}
	}
}

//初始化表单
function initGoodsForm(type, info){
	if (type == "add"){	
		//清空所有表单
		var tag = $(".merchant-goods-tag");
		for (var i = 0; i < tag.length; i++){
			tag[i].selectedIndex = 0;
		}
		address = new TAddress($("#merchant-goods-province"), $("#merchant-goods-city"));
		var input = $(".com-form-input");
		for (var i = 0; i < input.length; i++){
			input[i].value = "";
		}
		$("#merchant-goods-sale").innerHTML = "0";
	} else {
		//类型
		var tag = $(".merchant-goods-tag");
		var type = info[12].split(" ");
		var select = [0, 0, 0, 0, 0]; //标记5个选择框是否已用
		for (var i = 0; i < type.length; i++){
			for (var j = 0; j < tag.length; j++){
				if (select[j] == 0){ //该选择框还未被使用
					for(var k = 0; k < tag[j].options.length; k++){
						if (tag[j].options[k].value == type[i]){
							tag[j].selectedIndex = k;
							select[j] = 1; //标记为已使用
							break;
						}
					}
					if (select[j] == 1){ break; } //当前标签已完成选择 可继续下一标签
				}
			}
		}
		//描述
		$(".merchant-goods-dis")[0].value = info[0];
		//详细信息
		$(".merchant-goods-detail")[0].value = info[1];
		//所在地
		address = new TAddress($("#merchant-goods-province"), $("#merchant-goods-city"));
		$("#merchant-goods-city").options.add(new Option(info[2], info[2]));
		$("#merchant-goods-city").selectedIndex = 1;
		//库存
		$("#merchant-goods-stock").value = info[3];
		//价格
		$("#merchant-goods-price").value = info[4];
		//运费
		$("#merchant-goods-fare").value = info[5];
		//销量
		$("#merchant-goods-sale").innerHTML = info[6];
	}
}

//保存商品信息
function saveGoodsInfo(gid){	
	var url = "../php/editGoods.php?type=";
	if (gid !== undefined) { //editID为空则说明是新增
		url += "alter&gid="+gid; 
	} else {
		url += "add";
	}
	var type = "";
	var tag = $(".merchant-goods-tag");
	for (var i = 0; i < tag.length; i++){
		if (tag[i].options[tag[i].selectedIndex].value != ""){
			type += tag[i].options[tag[i].selectedIndex].value + " ";
		}
	}
	type = type.slice(0, -1);
	url += "&tag="+type+"&dis="+$(".merchant-goods-dis")[0].value+"&detail="+$(".merchant-goods-detail")[0].value+"&place="+address.getCity().Trim()+"&stock="+$("#merchant-goods-stock").value+"&price="+$("#merchant-goods-price").value+"&fare="+$("#merchant-goods-fare").value+"&oid="+sessionStorage.getItem("oid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ resultHandler("商品信息保存成功！", "抱歉，保存失败，请刷新重试。", "merchant.html?merchant-option-1"); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//选择照片
function chooseImg(){
	$("#merchant-upload-img").style.display = "block";
	if (TFunc.browser() == "MSIE"){   //根据浏览器来设置file样式
	    $("#user-upload").className = "user-upload";
	} else {
	    $("#user-upload").style.cssText = "display: none";
	}
}

//设置上传照片的url
function setAction(){
	$("#merchant-uploadForm").action = "../php/uploadImg.php?gid="+$("#merchant-goods-id").innerHTML;
}

//上传错误回调函数
function uploadError(n){
	$("#merchant-upload-tip").innerHTML = "上传出错！错误码：" + n;
}

//初始化订单模块
function initBillList(){
	$(".TPage02")[0].style.display = "block";
	//获取订单数据
	var url = "../php/merchant/getBillb.php?oid="+sessionStorage.getItem("oid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ getbXMLHandler(billbHandler); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//订单数据回调函数
function billbHandler(){
	if (ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReq.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (buff.length) buff.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {bid:"bid", gid:"gid", gdis:"gdis", uname:"uname", gprice:"gprice", gfare:"gfare", gnum:"gnum", bstatus:"bstatus", btime:"btime"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				buff.push(new Billb(item["bid"],item["gid"],item["gdis"],item["uname"],item["gprice"],item["gfare"],item["gnum"],item["bstatus"],item["btime"]));
			}
			$("#merchant-bnum").innerHTML = buff.length;
			new TPages($(".TPage02")[0], Math.ceil(buff.length/NUM), showBillb, 'TPage02-selected');
			showBillb(1); //显示商品信息
		} else {
		}		
	}
}

//显示订单
function showBillb(n){
	var tr = $(".merchant-bill-table")[0].getElementsByTagName("tr"); 
	while (tr.length > 1) $(".merchant-bill-table")[0].removeChild(tr[1]); //先清空之前的数据
	//计算终止项编号
	var end = n*NUM < buff.length ? n*NUM : buff.length;
	for (var i = (n-1)*NUM; i < end; i++){
	//for (var i = 0; i < buff.length; i++){
		//订单号 成交时间
		var p = document.createElement("tr");
		p.className = "user-bill-info";
		p.innerHTML = "订单编号：" + buff[i].bid + "&nbsp;&nbsp;&nbsp;&nbsp;成交时间：" + buff[i].btime;
		$(".merchant-bill-table")[0].appendChild(p);
		
		var tr = document.createElement("tr");
		tr.className = "com-table-item";
		$(".merchant-bill-table")[0].appendChild(tr);
		//商品
		td = document.createElement("td");
		tr.appendChild(td);
		var a = document.createElement("a");
		a.className = "com-cart-infoa";
		a.name = buff[i].gid;
		a.onclick = (function(str){
			return function(){
				window.open(PATH+"html/showGoods.html?"+str);
			}
		})(a.name);
		td.appendChild(a);
		var img = document.createElement("img");
		img.className = "com-cart-img";
		img.src = "../images/cover/"+buff[i].gid+".jpg";
		a.appendChild(img);
		var span = document.createElement("span");
		span.className = "com-cart-infodis";
		span.innerHTML = buff[i].gdis;
		a.appendChild(span);
		//买家
		td = document.createElement("td");
		td.innerHTML = buff[i].uname;
		tr.appendChild(td);
		//单价
		td = document.createElement("td");
		td.innerHTML = (buff[i].gprice*1).toFixed(2);
		tr.appendChild(td);
		//数量 
		td = document.createElement("td");
		td.innerHTML = buff[i].gnum
		tr.appendChild(td);
		//运费
		td = document.createElement("td");
		td.innerHTML = (buff[i].gfare*1).toFixed(2);
		tr.appendChild(td);
		//小计
		td = document.createElement("td");
		td.className = "cart-part";
		td.innerHTML = (buff[i].gprice*buff[i].gnum+buff[i].gfare*1).toFixed(2);
		tr.appendChild(td);
		//状态
		td = document.createElement("td");
		td.innerHTML = buff[i].bstatus;
		tr.appendChild(td);
		//操作
		td = document.createElement("td");
		tr.appendChild(td);
		var dele = document.createElement("p")
		dele.innerHTML = "取消";
		dele.className = "user-bill-operation";
		dele.onclick = (function(bid){ 
			return function(){
				var sure = showMakeSure("您确认要取消该订单么？");
				sure.onclick = function(){ 
					var url = "../php/deleBill.php?bid="+bid;
					url = encodeURI(encodeURI(url));//编码，避免传送时乱码
					ajaxReq.send("GET", url, true, function(){ resultHandler("订单已成功取消！", "抱歉，取消失败，请刷新重试。", "merchant.html?merchant-option-3"); }, "application/x-www-form-urlencoded; charset=UTF-8");
				}
			}
		})(buff[i].bid);
		td.appendChild(dele);
	}
}