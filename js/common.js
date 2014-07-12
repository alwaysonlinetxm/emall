//绝对路径
var PATH = "http://alwaysonlinetxm.ecustoj.info/emall/";
//建立全局购物车连接变量
var ajaxReqCart = new AjaxRequest();
//建立全局推荐项连接变量
var ajaxReqRec = new AjaxRequest();
//商品信息缓存数组
var goods = new Array();
//购物车商品信息缓存数组
var cartGoods = new Array();
//标记此次地址编辑是修改还是新增
var editID = "";
//地址全局变量
var address;
//商品信息类
function Goods(gid, gdis, gprice, gfare, gsale, gplace){
  this.gid = gid;
  this.gdis = gdis;
  this.gprice = gprice;
  this.gfare = gfare;
  this.gsale = gsale;
  this.gplace = gplace;
}

//获取页面顶部与可见部分的顶部的距离
window.onscroll = function(){
    var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    if(scrollTop != 0)
        $('.com-back')[0].style.visibility = 'visible';
    else
        $('.com-back')[0].style.visibility = 'hidden';
}

//获取登陆用户名
function getName(){
	return sessionStorage.getItem("uname") || localStorage.getItem("uname");
}

//检测登陆 未登录则转到登陆界面
function checkLogin(){
	var name = getName();
	if (name == null) { //未登录则转登陆页面
		window.location = PATH+"html/login.html"; 
		return false;
	} else {
		return true;
	}	
}

//搜索
function search(){
	sessionStorage.setItem("type", "");
	sessionStorage.setItem("tag", "");
	sessionStorage.setItem("seq", "");
	sessionStorage.setItem("dis", $("#com-search").value);
	window.location.href = PATH+"html/gridding.html";
}

//获取商品信息回调函数
function XMLHandler(handler){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    ajaxReq.send("GET", PATH+"xml/data.xml", true, handler);
	}
}

//获取商品信息回调函数
function getXMLHandler(handler){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    ajaxReq.send("GET", PATH+"xml/"+sessionStorage.getItem("uid")+"data.xml", true, handler);
	}
}

//获取购物车信息回调函数
function cartXMLHandler(handler){
    if(ajaxReqCart.getReadyState() === 4 && ajaxReqCart.getStatus() === 200){
	    ajaxReqCart.send("GET", PATH+"xml/"+sessionStorage.getItem("uid")+"cart.xml", true, handler);
	}
}

//获取节点文本
function getText(elem) {
    var text = "";
    if (elem) {
        if (elem.childNodes) {
            for (var i = 0; i < elem.childNodes.length; i++) {
                var child = elem.childNodes[i];
                if (child.nodeValue){
                    text += child.nodeValue;
                } else {
                    if (child.childNodes[0]){
                        if (child.childNodes[0].nodeValue){
                            text += child.childNodes[0].nodeValue;
						}
					}	
                }
            }
        }
    }
    return text;
}

//添加商品显示
function addGoodsShow(li, gid, gdis, gprice, gfare){
	var a = document.createElement("a");
	a.name = gid;
	a.onclick = (function(str){
		return function(){
			window.open(PATH+"html/showGoods.html?"+str);
		}
	})(a.name);
	li.appendChild(a);
	var img = document.createElement("img");
	img.src = PATH+"images/cover/" + gid + ".jpg";
	img.className = "goods-inter-img";
	a.appendChild(img);
	var p1 = document.createElement("p");
	var price = document.createElement("span");
	price.innerHTML = "￥" + (gprice*1).toFixed(2);
	price.className = "grid-cont-price";
	p1.appendChild(price);
	var fare = document.createElement("span");
	fare.innerHTML = "运费：" + (gfare*1).toFixed(2);
	fare.className = "grid-cont-fare";
	p1.appendChild(fare);
	a.appendChild(p1);
	var dis = document.createElement("p");
	dis.className = "grid-cont-dis";
	dis.innerHTML = gdis;
	a.appendChild(dis); 
}

//添加提示窗口 返回容器元素
function addTipWindow(url){
	var back = document.createElement("div");
	back.className = "com-black-back";
	document.body.appendChild(back);
	var div = document.createElement("div");
	div.className = "com-black-container";
	back.appendChild(div);
	var close = document.createElement("a");
	close.className = "com-black-close";
	close.onclick = function(){ 
		document.body.removeChild(back);
		//history.go(0); chrome下失效
		if (url != null){
			window.location.href = url;
		} else {
			location.reload(true);
		}
	}
	div.appendChild(close);
	return div;
}

//初始化购物车
function initCart(){
	var name = getName();
	if (name != null){
		var url = PATH+"php/GoodsGet.php?type=cart&uid="+sessionStorage.getItem("uid");
		url = encodeURI(encodeURI(url));//编码，避免传送时乱码
		ajaxReqCart.send("GET", url, true, function(){ cartXMLHandler(getCartHandler); }, "application/x-www-form-urlencoded; charset=UTF-8");
	}
}

//获取购物车数据回调函数
function getCartHandler(){
	if (ajaxReqCart.getReadyState() === 4 && ajaxReqCart.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReqCart.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (cartGoods.length) cartGoods.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {gid:"gid", gdis:"gdis", gprice:"gprice"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				cartGoods.push(new Goods(item["gid"],item["gdis"],item["gprice"]));
			}
			addToCart();//将信息添加到购物车一栏
		} 
	}
}

//将信息添加到购物车一栏
function addToCart(){
	$(".com-nav-cart")[0].innerHTML = "";//先清空之前的数据
	$(".com-cart-num")[0].innerHTML = cartGoods.length;
	var li = document.createElement("li");
	li.className = "TClearfix";
	$(".com-nav-cart")[0].appendChild(li);
	var a = document.createElement("a");
	a.className = "com-cart-tip";
	a.innerHTML = "购物车中部分最新物品：";
	li.appendChild(a);
	var len = cartGoods.length < 6 ? cartGoods.length : 6;
	for (var i = 0; i < len; i++){
		var li = document.createElement("li");
		li.className = "TClearfix com-cart-li";
		$(".com-nav-cart")[0].appendChild(li);
		var a = document.createElement("a");
		a.name = cartGoods[i].gid;
		a.className = "com-cart-a";
		a.onclick = (function(str){
			return function(){
				window.open(PATH+"html/showGoods.html?"+str);
			}
		})(a.name);
		li.appendChild(a);
		var img = document.createElement("img");
		img.src = PATH+"images/cover/" + cartGoods[i].gid + ".jpg";
		img.className = "com-cart-img";
		a.appendChild(img);
		var dis = document.createElement("span");
		dis.className = "com-cart-dis";
		dis.innerHTML = cartGoods[i].gdis;
		a.appendChild(dis);
		var right = document.createElement("div");
		right.className = "com-cart-right";
		li.appendChild(right);
		var price = document.createElement("p");
		price.className = "com-cart-price";
		price.innerHTML = "￥" + (cartGoods[i].gprice*1).toFixed(2);
		right.appendChild(price);
		var dele = document.createElement("p");
		dele.className = "com-cart-dele";
		dele.innerHTML = "删除";
		dele.onclick = function(e){
			deleGoods("cart", e.target.parentNode.previousSibling.name, deleCartHandler);
		}
		right.appendChild(dele);
	}
	li = document.createElement("li");
	$(".com-nav-cart")[0].appendChild(li);
	var span = document.createElement("span");
	span.className = "TB01-button TB01-white TB01-medium com-cart-goto";
	span.innerHTML = "查看购物车";
	span.onclick = function(){ window.location.href = PATH+"html/cart.html"; };
	li.appendChild(span);
}

//显示确认框 并返回确认按钮元素
function showMakeSure(str){
	var div = addTipWindow();
	var text = document.createElement("p");
	text.className = "user-dele-text";
	text.innerHTML = str ? str : "您确定要删除该商品么？";
	div.appendChild(text);
	var sure = document.createElement("a");
	sure.className = "TB01-button TB01-gray button05";
	sure.innerHTML = "确 定";
	//点击确定后移除窗口
	TFunc.on(sure, "click", function(){ document.body.removeChild(div.parentNode); });
	div.appendChild(sure);
	var cancel = document.createElement("a");
	cancel.className = "TB01-button TB01-gray button05";
	cancel.innerHTML = "取 消";
	cancel.onclick = function(){ document.body.removeChild($(".com-black-back")[0]); }
	div.appendChild(cancel);
	return sure;
}

//删除购物车项回调函数
function deleCartHandler(){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
		var str = ajaxReq.getResponseText().Trim();
		if (str == 1){
			//history.go(0); chrome下失效
			location.reload(true);
		} else {
			$(".com-black-container")[0].innerHTML = "<p class='user-dele-text'>删除失败，请刷新重试。</p>";
		}
	}
}

//添加收藏/购物车
function addGoods(type, gid, succ, fail){
	if (checkLogin()){
		var url = "../php/goodsAdd.php?type="+type+"&gid="+gid+"&uid="+sessionStorage.getItem("uid");
		url = encodeURI(encodeURI(url));//编码，避免传送时乱码
		ajaxReq.send("GET", url, true, function(){ resultHandler(succ, fail); }, "application/x-www-form-urlencoded; charset=UTF-8");
	}
}

//添加结果回调函数 参数为添加成功和失败的提示 以及页面刷新后的url
function resultHandler(succ, fail, url){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
		var str = ajaxReq.getResponseText().Trim();
		var div = addTipWindow(url);
		var p = document.createElement("p");
		p.className = "com-black-content";
		div.appendChild(p);
		if (str == 1){	
			var img = document.createElement("img");
			img.src = "../images/pass.png";
			p.appendChild(img);
			var span = document.createElement("span");
			span.className = "com-black-text";
			span.innerHTML = succ;
			p.appendChild(span);			
		} else {
			p.innerHTML = fail;
		}
	}
}

//删除收藏/购物车
function deleGoods(type, gid, handler){
	var sure = showMakeSure();
	sure.onclick = function(){ 
		var url = "../php/deleGoods.php?type="+type+"&gid="+gid+"&uid="+sessionStorage.getItem("uid");
		url = encodeURI(encodeURI(url));//编码，避免传送时乱码
		ajaxReq.send("GET", url, true, handler, "application/x-www-form-urlencoded; charset=UTF-8");
	}
}

//获取推荐项 参数是要获取的项数
function getRecom(url){
	ajaxReqRec.send("GET", url, true, recomHandler, "application/x-www-form-urlencoded; charset=UTF-8");
}

//推荐项回调函数
function recomHandler(){
	if(ajaxReqRec.getReadyState() === 4 && ajaxReqRec.getStatus() === 200){
		var str = ajaxReqRec.getResponseText().Trim();
		var inter = str.split("|");
		var li = $(".com-recom");
		for (var i = 0; i < inter.length; i++){
			var attr = inter[i].split("#");
			addGoodsShow(li[i], attr[0], attr[1], attr[2], attr[3]);
		}
	}
}

//设置默认收获地址 参数是地址ID以及成功后要跳往的url
function setDefaultAddress(aid, succurl){
	var url = "../php/editAddress.php?type=default&aid="+aid+"&uid="+sessionStorage.getItem("uid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ resultHandler("默认地址设置成功！", "抱歉，设置失败，请刷新重试。", succurl); }, "application/x-www-form-urlencoded; charset=UTF-8");	
}

//保存地址
function saveAddress(succurl){
	var url = "../php/editAddress.php?type=";
	if (editID !== "") { //editID为空则说明是新增
		url += "alter&aid="+editID; 
	} else {
		url += "add&aid="+editID;
	}
	url += "&person="+$(".com-address-person")[0].value+"&region="+address.getProvince().Trim()+" "+address.getCity().Trim()+" "+address.getArea().Trim()+"&street="+$(".com-address-street")[0].value+"&post="+$(".com-address-post")[0].value+"&mobile="+$(".com-address-mobile")[0].value+"&default="+($("#com-address-default").checked?1:0)+"&uid="+sessionStorage.getItem("uid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ resultHandler("地址保存成功！", "抱歉，保存失败，请刷新重试。", succurl); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//取消修改地址，清空表单内容 参数是还需执行的处理操作函数
function cancelAddress(func){
	editID = "";  //清除修改地址ID
	$(".com-address-person")[0].value = "";
	address = new TAddress($('#com-province'), $('#com-city'), $('#com-area'));
	$(".com-address-street")[0].value = "";
	$(".com-address-post")[0].value = "";
	$(".com-address-mobile")[0].value = "";
	if (func != undefined) { func(); }
}

//检测输入框是否合法
function checkTip(){
	var tip = document.getElementsByClassName("com-tip-check");
	for (var i = 0; i < tip.length; i++){
		var color = TFunc.getStyle(tip[i]).color;
		if (color == "#f00" || color == "#ff0000" || color == "rgb(255, 0, 0)"){ return false; }
	}
	return true;
}

//更改剩余字数
function alterNum(ele, n){
	var rest = n - ele.value.length; 
	var next = TFunc.nextNode(ele);
	if (rest >= 0){
		next.innerHTML = "您还可以输入 <span class='com-word-num'></span> 字";
		next.style.color = "#999";
		next.getElementsByClassName("com-word-num")[0].innerHTML = rest;
	} else {
	    next.innerHTML = "已经超出 <span class='com-word-num'></span> 字";
		next.style.color = "#f00";
		next.getElementsByClassName("com-word-num")[0].innerHTML = -rest;
	}
}

//搜索框内容改变
function inputChange(){
	//输入框内容不为空时进行关键词匹配
	if ($("#com-search").value != ""){
		var url = PATH+"php/keyword.php?word="+$("#com-search").value;
		url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
        ajaxReq.send("GET", url, true, keywordHandler, "application/x-www-form-urlencoded; charset=UTF-8");
	} else {
		tipHide();
	}
}

//关键词回调函数
function keywordHandler(){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		if (str != ""){
			//清空之前的列表
			$("#com-search-tip").innerHTML = "";
			//显示提示框
			$("#com-search-tip").style.display = "block";
			var words = str.split("|");
			for (var j = 0; j < words.length; j++){
				var word = document.createElement("li");
				word.innerHTML = words[j];
				$("#com-search-tip").appendChild(word);
			}
			var li = $("#com-search-tip").getElementsByTagName("li");
			for (var i = 0; i < li.length; i++){
				TFunc.on(li[i], "mousedown", function(e){
					//替换输入框关键词
					$("#com-search").value = e.target.innerHTML;
					$("#com-search-button").click();
				});
			}
		}
	}
}

//隐藏提示内容
function tipHide(){
	$("#com-search-tip").style.display = "none";
}
