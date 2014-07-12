//选择属性
var attr = new Array();
//当前页数
var page = 1;
//每页显示的商品数
var NUM = 20;
//初始化要显示的分类和标签
function initTypeTag(){
	initType(); //初始化大类
	initTag(sessionStorage.getItem("tag"));  //初始化标签
	showType(sessionStorage.getItem("type"));
	initSequence(sessionStorage.getItem("seq"));
	setTagBg($(".grid-sequence")[0], sessionStorage.getItem("seq"));
	
	getGoods(); //获取商品
}

//将类型转换为class
function exType(type){
	switch (type){
		case "影视": return "grid-film-tag";
			break;
		case "音乐": return "grid-music-tag";
			break;
		case "游戏": return "grid-game-tag";
			break;
		case "动漫": return "grid-anime-tag";
			break;
	}
}

//设置选中标签的背景,参数是标签做在行的父li元素，和选中标签值
function setTagBg(father, tag){
	var a = father.getElementsByTagName("a");
	var empty = true;
	for (var j = 0; j < a.length; j++){
		if (a[j].innerHTML == tag) { 
			a[j].className = "grid-sort-afocus"; 
			empty = false;
		} else {
			a[j].className = ""; 
		}
	}
	if (empty) { a[0].className = "grid-sort-afocus"; };
}

//初始化大类
function initType(){
	var a = $(".grid-type")[0].getElementsByTagName("a");
	for (var i = 0; i < a.length; i++){
		a[i].onclick = (function(n){
			return function(){  
				sessionStorage.setItem("type", a[n].innerHTML); //更改大类标签
				sessionStorage.setItem("tag", "");
				showType(a[n].innerHTML);
				getGoods(); //获取商品
			}
		})(i);
	}
}

//初始化标签
function initTag(){
	var li = $(".grid-sort")[0].getElementsByTagName("li");
	for (var i = 1; i < li.length-1; i++){ //出去第一行大类行
		var a = li[i].getElementsByTagName("a");
		for (var j = 0; j < a.length; j++){
			a[j].onclick = function(event){ 
				setTagBg(event.target.parentNode, event.target.innerHTML);
				sessionStorage.setItem("tag", "");
				var sli = $(".grid-sort")[0].getElementsByClassName(exType(sessionStorage.getItem("type")));
				for (var p = 0; p < sli.length; p++){ //出去第一行大类行
					var sa = sli[p].getElementsByTagName("a");
					for (var q = 0; q < sa.length; q++){ //确定二级标签
						if (sa[q].className.indexOf("grid-sort-afocus") != -1){ 
							if (sa[q].innerHTML != "不限"){ 
								if (sessionStorage.getItem("tag") == "") {
									sessionStorage.setItem("tag", sessionStorage.getItem("tag") + sa[q].innerHTML);
								} else {
									sessionStorage.setItem("tag", sessionStorage.getItem("tag") + "|" + sa[q].innerHTML); 
								}
							}
							break;
						}
					}
				}
				getGoods(); //获取商品
			};
		}
	}
}

//初始化排序
function initSequence(type){
	var a = $(".grid-sequence")[0].getElementsByTagName("a");
	for (var i = 0; i < a.length; i++){
		a[i].onclick = (function(n){
			return function(){  
				sessionStorage.setItem("seq", a[n].innerHTML); //更改顺序标签
				setTagBg($(".grid-sequence")[0], sessionStorage.getItem("seq"));
				showGoods(1); //获取商品
			}
		})(i);
	}
}

//显示大类下的分类
function showType(type){
	var li = $(".grid-sort")[0].getElementsByTagName("li");
	
	setTagBg(li[0], type);//设置大类选中的标签	
	for (var i = 1; i < li.length-1; i++){
		li[i].style.display = "none"; 
	}
	type = exType(type);
	for (var j = 0; j < $("."+type).length; j++){
		$("."+type)[j].style.display = "block"; 
		setTagBg($("."+type)[j], sessionStorage.getItem("tag"));
	}
}

//获取商品信息
function getGoods(){
	var url = "../php/getGoods.php?tag=";
	if (sessionStorage.getItem("type") != "不限" && sessionStorage.getItem("tag") != ""){ 
		url = url + sessionStorage.getItem("type") + "|" + sessionStorage.getItem("tag") + "&dis=" + sessionStorage.getItem("dis"); 
	} else if (sessionStorage.getItem("type") == "不限" && sessionStorage.getItem("tag") != ""){ 
		url = url + sessionStorage.getItem("tag") + "&dis=" + sessionStorage.getItem("dis"); 
	} else if (sessionStorage.getItem("type") != "不限" && sessionStorage.getItem("tag") == ""){
		url = url + sessionStorage.getItem("type") + "&dis=" + sessionStorage.getItem("dis");
	} else {
		url = url + "&dis=" + sessionStorage.getItem("dis");
	}
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
	ajaxReq.send("GET", url, true, function(){XMLHandler(goodsHandler);}, "application/x-www-form-urlencoded; charset=UTF-8");
	$('.grid-content')[0].innerHTML = "<div style='margin:80px auto;width:76px'><img src='../images/wait03.gif'></div>";	
}

//处理xml文件，生成节点
function goodsHandler(name){
    if (ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReq.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (goods.length) goods.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
			$('.grid-numTip')[0].style.display = "block";
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {gid:"gid", gdis:"gdis", gprice:"gprice", gfare:"gfare",gsale:"gsale", gplace:"gplace"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				goods.push(new Goods(item["gid"],item["gdis"],item["gprice"],item["gfare"],item["gsale"],item["gplace"]));
			}
			new TPages($(".TPage02")[0], Math.ceil(goods.length/NUM), showGoods, 'TPage02-selected');
			showGoods(1); //显示商品
		} else {
			$('.grid-numTip')[0].style.display = "none";
		    $('.grid-content')[0].innerHTML = "<p style='margin:80px auto;width:180px;font-size:18px'>抱歉，没有相关结果</p>";
			new TPages($(".TPage02")[0], Math.ceil(goods.length/NUM), showGoods, 'TPage02-selected');
		}
	}
}

//显示商品
function showGoods(n){
	//更新当前页数
	//排序
	switch (sessionStorage.getItem("seq")){
		case "默认":
			break;
		case "销量": goods.sort(function(a,b){return (a.gsale)*1 < b.gsale ? 1 : -1;});
			break;
		case "价格": goods.sort(function(a,b){return (a.gprice)*1 > b.gprice ? 1 : -1;});
			break;
	}
	
	$('.grid-content')[0].innerHTML = "";
	$('.com-number')[0].innerHTML = goods.length;
	var end = n*NUM < goods.length ? n*NUM : goods.length;
	for (var i = (n-1)*NUM; i < end; i++){
		var li = document.createElement("li");
		var a = document.createElement("a");
		a.name = goods[i].gid;
		a.onclick = (function(str){
			return function(){
				window.open(PATH+"html/showGoods.html?"+str);
			}
		})(a.name);
		li.appendChild(a);
		var img = document.createElement("img");
		img.src = "../images/cover/" + goods[i].gid + ".jpg";
		a.appendChild(img);
		var p1 = document.createElement("p");
		var price = document.createElement("span");
		price.innerHTML = "￥" + (goods[i].gprice*1).toFixed(2);
		price.className = "grid-cont-price";
		p1.appendChild(price);
		var fare = document.createElement("span");
		fare.innerHTML = "运费：" + (goods[i].gfare*1).toFixed(2);
		fare.className = "grid-cont-fare";
		p1.appendChild(fare);
		a.appendChild(p1);
		var p2 = document.createElement("p");
		p2.innerHTML = "销量：" + goods[i].gsale;
		p2.className = "grid-cont-sale";
		var place = document.createElement("span");
		place.innerHTML = "所在地：" + goods[i].gplace;
		place.className = "grid-cont-place";
		p2.appendChild(place);
		a.appendChild(p2);
		var dis = document.createElement("p");
		dis.className = "grid-cont-dis";
		dis.innerHTML = goods[i].gdis;
		a.appendChild(dis);
		$(".grid-content")[0].appendChild(li);
	}
	$("#com-search").value = sessionStorage.getItem("dis");
}

//设置关键词
function setDis(){
	showType("不限");
	sessionStorage.setItem("type", "");
	sessionStorage.setItem("tag", "");
	sessionStorage.setItem("seq", "");
	sessionStorage.setItem("dis", $("#com-search").value);
	getGoods(); //获取商品
}