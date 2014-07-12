//商家ID缓存
var oid = "";
//播放器
var player = "";
//评论类
function Eval(uid, uname, egrade, econt, etime){
  this.uid = uid;
  this.uname = uname;
  this.egrade = egrade;
  this.econt = econt;
  this.etime = etime;
}
//成交记录类
function Deal(uname, gprice, gnum, btime){
  this.uname = uname;
  this.gprice = gprice;
  this.gnum = gnum;
  this.btime = btime;
}

function initGoods(){
	var gid = window.location.search.slice(1);
	//获取商品信息
	var url = encodeURI(encodeURI("../php/goodsInfo.php?gid="+gid)); //编码，避免传送时乱码
	ajaxReq.send("GET", url, true, infoHandler, "application/x-www-form-urlencoded; charset=UTF-8");
	$(".grid-cart")[0].onclick = function(){ 
		addGoods("cart", gid, "成功添加！已将该商品加入您的购物车。", "该商品已在您的购物车中了。"); 
	};
	$(".goods-coll")[0].onclick = function(){ 
		addGoods("coll", gid, "成功添加！已将该商品加入您的收藏夹。", "该商品已在您的收藏夹中了。"); 
	};
	$(".grid-buy")[0].onclick = function(){ 
		if (checkLogin()){
			if (!checkTip()){ return; }; //检测输入框是否合法
			window.location.href = "bill.html?"+window.location.search.slice(1)+"|"+$(".goods-bnum")[0].value;			
		}
	};
}

function infoHandler(){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){ 
		var str = ajaxReq.getResponseText().Trim();
		if (str.slice(0, 1) == 1){
			str = str.slice(1);
			var info = str.split("|");
			//设置商品标题
			$(".goods-title")[0].innerHTML = info[0];
			//设置放大预览
			var mag = new TMagnifier(350.0, 350.0, $(".goods-preview")[0], $(".goods-result")[0], 2);
			mag.loadImg("../images/cover/"+window.location.search.slice(1)+".jpg");
			//设置价格
			$(".goods-price")[0].innerHTML = "￥ " + (info[4]*1).toFixed(2);
			//设置所在地
			$(".goods-place")[0].innerHTML = " " + info[2];
			//设置运费
			$(".goods-fare")[0].innerHTML = " ￥" + (info[5]*1).toFixed(2);
			//设置销量
			$(".goods-sale")[0].innerHTML = " " + info[6] + " ";
			//设置评分
			$(".goods-grade")[0].innerHTML = " " + (info[7]*1).toFixed(1) + " ";
			$(".goods-eval")[0].innerHTML = " " + info[8] + " ";
			$("#goods-eval-num").innerHTML = info[8];
			$("#goods-deal-num").innerHTML = info[11];
			$(".goods-orange-container")[0].style.width = Math.floor(76*info[7]/5) + "px";
			//设置库存
			$(".goods-stock")[0].innerHTML = " " + info[3] + " ";
			$(".goods-bnum")[0].onfocus = function(){ 
				var num = $(".goods-bnum")[0].value;
				if (!(num.match(/^[0-9]*$/g) != null && num*1 > 0 && num*1 <= $(".goods-stock")[0].innerHTML*1)){
					$(".goods-bnum")[0].value = "1"; 
				}
				$(".goods-bnumTip")[0].innerHTML = "";
			}
			$(".goods-bnum")[0].onblur = function(){ 
				var num = $(".goods-bnum")[0].value;
				if (!(num.match(/^[0-9]*$/g) != null && num*1 > 0 && num*1 <= $(".goods-stock")[0].innerHTML*1)){
					$(".goods-bnumTip")[0].innerHTML = "请正确填写数量！";
					$(".goods-bnumTip")[0].style.color = "#f00";
				}
			}
			//设置收藏
			$(".goods-coll")[0].innerHTML = " 收藏(" + info[9] + ") ";
			//设置商品详情
			for (var i = 0; i < 10; i++){
				$(".goods-feedback-content")[0].innerHTML += info[1]+"<br />";
			}
			$(".goods-feedback-content")[0].style.display = "block";
			$(".goods-feedback-title")[0].getElementsByTagName("a")[0].style.color = "#111";
			$(".goods-feedback-title")[0].style.borderBottom = "none";
			//设置商家ID
			oid = info[10];			
			//成功获取商品信息后获取排行榜信息
			ajaxReq.send("GET", "../php/goodsRank.php", true, rankHandler, "application/x-www-form-urlencoded; charset=UTF-8");
		}
	}
}

//排行榜回调函数
function rankHandler(){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
		var str = ajaxReq.getResponseText().Trim();
		var ranks = str.split("|");
		var a = $(".goods-rank")[0].getElementsByTagName("a");
		for (var i = 0; i < a.length; i++){
			a[i].innerHTML = ranks[i].slice(6);
			a[i].onclick = (function(str){
				return function(){
					window.open(PATH+"html/showGoods.html?"+str);
				}
			})(ranks[i].slice(0, 6));
		}
		//成功获取排行榜信息后获取伪关联信息
		var url = encodeURI(encodeURI("../php/goodsInter.php?oid="+oid+"&gid="+window.location.search.slice(1)));
		//编码，避免传送时乱码
		getRecom(url); //获取推荐信息
	}
}

//显示选项卡
function showFeedback(e, id){
	var li = $(".goods-feedback-content");
	for (var i = 0; i < li.length; i++){
		if (li[i].id == id) { 
			li[i].style.display = "block";
		} else {
			li[i].style.display = "none";
		}
	};
	li = $(".goods-feedback-title");
	for (var i = 0; i < li.length; i++){
		if (li[i] == e) { 
			li[i].getElementsByTagName("a")[0].style.color = "#111";
			li[i].style.borderBottom = "none";
		} else {
			li[i].getElementsByTagName("a")[0].style.color = "#999";
			li[i].style.borderBottom = "1px solid #ccc";
		}
	};
	//获取评价，成交记录等信息
	switch (id){
		case "goods-eval": initEval();
			break;
		case "goods-deal": initDeal();
			break;
		case "goods-listen": initListen();
			break;
	}
}

//获取评论数据
function initEval(){
	$('.goods-evals')[0].innerHTML = "<div style='margin:100px 270px;width:76px'><img src='../images/wait03.gif'></div>";
	var url = "../php/getEval.php?uid="+sessionStorage.getItem("uid")+"&gid="+window.location.search.slice(1);
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码
	ajaxReq.send("GET", url, true, function(){ getXMLHandler(evalHandler); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//评论回调函数
function evalHandler(){
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
				var item = {uid:"uid", uname:"uname", egrade:"egrade", econt:"econt", etime:"etime"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				goods.push(new Eval(item["uid"],item["uname"],item["egrade"],item["econt"],item["etime"]));
			}
			showEval();//显示评论
		}		
	}
}

//显示评论
function showEval(){
	$(".goods-grade")[1].innerHTML = $(".goods-grade")[0].innerHTML;
	$('.goods-evals')[0].innerHTML = "";
	var grade = [0, 0, 0, 0, 0];
	var max = 0;
	for (var i = 0; i < goods.length; i++){
		var li = document.createElement("li");
		li.className = "goods-eval-item TClearfix";
		$(".goods-evals")[0].appendChild(li);
		var  left = document.createElement("div");
		left.className = "goods-eval-left";
		li.appendChild(left);
		var  img = document.createElement("img");
		img.className = "goods-eval-icon";
		img.src = "../images/icons/icon" + goods[i].uid + ".png";
		left.appendChild(img);
		var  uname = document.createElement("p");
		uname.className = "goods-eval-uname";
		uname.innerHTML = goods[i].uname;
		left.appendChild(uname);
		var  right = document.createElement("div");
		right.className = "goods-eval-right";
		li.appendChild(right);
		var  cont = document.createElement("p");
		cont.className = "goods-eval-cont";
		cont.innerHTML = goods[i].econt;
		right.appendChild(cont);
		var  time = document.createElement("p");
		time.className = "goods-eval-time";
		time.innerHTML = "发表于：" + goods[i].etime;
		right.appendChild(time);
		//记录评分数分布
		grade[goods[i].egrade-1]++;
		if (grade[goods[i].egrade-1] > max) { max = grade[goods[i].egrade-1]; }
	}
	//设置评分分布
	for (var i = 0; i < 5; i++){
		$(".goods-strip-length")[i].style.width = Math.floor(100*(grade[4-i]/max)) + "px";
		$(".goods-percent")[i].innerHTML = " " + (100*(grade[4-i]/goods.length)).toFixed(1) + "%";
	}
}

//获取成交记录
function initDeal(){
	var url = "../php/getDeal.php?gid="+window.location.search.slice(1);
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码
	ajaxReq.send("GET", url, true, function(){ XMLHandler(dealHandler); }, "application/x-www-form-urlencoded; charset=UTF-8");
	$(".goods-deal-wait")[0].innerHTML = "<div style='margin:50px auto;width:76px'><img src='../images/wait03.gif'></div>";
}

//成交记录回调函数
function dealHandler(){
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
				var item = {uname:"uname", gprice:"gprice", gnum:"gnum", btime:"btime"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				goods.push(new Deal(item["uname"],item["gprice"],item["gnum"],item["btime"]));
			}			
			showDeal();//显示成交记录
		}
		$(".goods-deal-wait")[0].innerHTML = ""; //移除等待图标		
	}
}

//显示成交记录
function showDeal(){
	$(".goods-deal-num")[0].innerHTML = goods.length;
	var tr = $(".goods-deal-table")[0].getElementsByTagName("tr"); 
	while (tr.length > 1) $(".goods-deal-table")[0].removeChild(tr[1]); //先清空之前的数据
	for (var i = 0; i < goods.length; i++){
		var tr = document.createElement("tr");
		tr.className = "com-table-item";
		$(".goods-deal-table")[0].appendChild(tr);
		//买家
		var td = document.createElement("td");
		td.innerHTML = goods[i].uname;
		tr.appendChild(td);
		//成交价
		td = document.createElement("td");
		td.innerHTML = (goods[i].gprice*1).toFixed(2);
		tr.appendChild(td);
		//数量 
		td = document.createElement("td");
		td.innerHTML = goods[i].gnum
		tr.appendChild(td);
		//成交时间
		td = document.createElement("td");
		td.innerHTML = goods[i].btime;
		tr.appendChild(td);
		//款式和型号
		td = document.createElement("td");
		td.innerHTML = "默认款式";
		tr.appendChild(td);
	}
}

//初始化试听列表
function initListen(){
	var url = "../php/getSong.php?gid="+window.location.search.slice(1);
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码
	ajaxReq.send("GET", url, true, songHandler, "application/x-www-form-urlencoded; charset=UTF-8");
	$(".goods-song-list")[0].innerHTML = "<div style='margin:50px auto;width:76px'><img src='../images/wait03.gif'></div>";
}

//获取歌曲列表回调函数
function songHandler(){
	if (ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
		var str = ajaxReq.getResponseText().Trim();
		//存在试听歌曲时
		if (str != "0"){ 
			$(".goods-song-list")[0].innerHTML = ""; //移除等待图标
			//播放器配置参数
			var config = {
				media: $("#goods-song-play"),
				source: [$("#goods-song-mp3"), $("#goods-song-ogg")],
				previous: $(".TPlayer01-previous")[0],
				next: $(".TPlayer01-next")[0],
				play: {
					play: $(".TPlayer01-pause")[0],
					playClass: "TPlayer01-play",
					pauseClass: "TPlayer01-pause"
				},
				stop: $(".TPlayer01-stop")[0],
				currentInfo:$(".TPlayer01-current-info")[0],
				bar: {
					bar: $(".TPlayer01-bar")[0],
					length: 212,
					barInset: $(".TPlayer01-bar-inset")[0],
					barEnd: $(".TPlayer01-bar")[0].getElementsByClassName("TPlayer01-end")[0]
				},
				volume: {
					volume: $(".TPlayer01-volume")[0],
					length: 40,
					volumeInset: $(".TPlayer01-volume-inset")[0],
					volumeEnd: $(".TPlayer01-volume")[0].getElementsByClassName("TPlayer01-end")[0],
					volumeClass: "TPlayer01-volume-icon",
					muteClass: "TPlayer01-mute-icon",
					volumeIcon: $(".TPlayer01-volume-icon")[0]
				},
				time: {
					current: $(".TPlayer01-currentTime")[0],
					duration: $(".TPlayer01-duration")[0]
				}
			};
			//创建播放器
			player = new TPlayer(config);
			var songs = str.split("|");
			for (var i = 0; i < songs.length; i += 2){
				var li = document.createElement("li");
				$(".goods-song-list")[0].appendChild(li);
				var num = document.createElement("span");
				num.className = "goods-song-num";
				num.innerHTML = i/2 + 1;
				li.appendChild(num);
				var name = document.createElement("span");
				name.className = "goods-song-name";
				name.innerHTML = songs[i];
				li.appendChild(name);
				var button = document.createElement("button");
				button.className = "TB02 TB02-cyan button10";
				button.innerHTML = " 试 听";
				button.onclick = (function(num){
					return function(){
						player.setCurrentInfo(num, true, 130);
						player.setCurrentSong(num, true);
					}
				})(i/2);
				li.appendChild(button);
				//为播放器添加曲目
				player.addSong(songs[i], ["../audio/"+songs[i+1]+".mp3", "../audio/"+songs[i+1]+".ogg"]);
			}
		} else {
			$(".goods-song-list")[0].innerHTML = "暂无";
		}
	}
}