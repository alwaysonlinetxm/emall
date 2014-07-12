//每页显示非回复的消息数
var MessNUM = 10;
//缓存回复的消息
var message = new Array();
//信息类
function Message(mid, reply, uid, uname, content, subdate){
  this.mid = mid;
  this.reply = reply;
  this.uid = uid;
  this.uname = uname;
  this.content = content;
  this.subdate = subdate;
}
//留言内容初始化
function initForum(){
	ajaxReq.send("GET", encodeURI(encodeURI("../php/getMessage.php")), true, function(){XMLHandler(messageHandler);}, "application/x-www-form-urlencoded; charset=UTF-8");
	$(".forum-content")[0].innerHTML = "<div style='margin:100px auto;width:76px'><img src='../images/wait03.gif'></div>";
	//发表按钮事件
	$("#forum-submit").onclick = function(){
		//检测登陆
		if (!checkLogin()){ return; }
		//检测输入
		if ($("#forum-text").value == ""){ 
			$("#forum-tip").innerHTML = "内容不能为空！";
			$("#forum-tip").style.color = "#f00";
			return;
		}
		var color = TFunc.getStyle($("#forum-tip")).color;
		if (color == "#f00" || color == "#ff0000" || color == "rgb(255, 0, 0)"){ return; }
		addMessage(0, $("#forum-text").value); //新增消息
	}
}

//获取消息回调函数
function messageHandler(){
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
				var item = {mid:"mid",reply:"reply",uid:"uid",uname:"uname",content:"content",subdate:"subdate"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				//记录非回复消息的条数
				if (item["reply"] == 0){ 
					goods.push(new Message(item["mid"],item["reply"],item["uid"],item["uname"],item["content"],item["subdate"]));
				} else { //回复消息数
					message.push(new Message(item["mid"],item["reply"],item["uid"],item["uname"],item["content"],item["subdate"]));
				}
			}
			//分页显示消息
			new TPages($("#forum-page"), Math.ceil(goods.length/MessNUM), showMessage, "TPage02-selected", 1);
			showMessage(1); //显示消息
		} 
	}
}

//显示信息
function showMessage(num){
	var messageReply = new Array(); //回复缓存数组
    $(".forum-content")[0].innerHTML = ""; //移除等待内容或之前的痕迹
	var end = num*MessNUM < goods.length ? num*MessNUM : goods.length;
    for (var i = (num-1)*MessNUM; i < end; i++){
	    var entry = document.createElement("li");
		entry.className = "forum-entry TClearfix";
		entry.id = "forum-entry" + goods[i].mid;
		entry.reply = goods[i].reply;
		$(".forum-content")[0].appendChild(entry);
		var left = document.createElement("div");
		left.className = "forum-cont-left";
		entry.appendChild(left);
		var img = document.createElement("img");
		img.className = "forum-cont-icon";
		img.src = "../images/icons/icon" + goods[i].uid + ".png?ver="+Math.random();
		left.appendChild(img);
		var uname = document.createElement("p");
		uname.className = "goods-eval-uname forum-cont-uname";
		uname.innerHTML = goods[i].uname;
		left.appendChild(uname);
		var right = document.createElement("div");
		right.className = "forum-cont-right";
		entry.appendChild(right);
		var cont = document.createElement("p");
		cont.className = "forum-cont-cont";
		cont.innerHTML = goods[i].content;
		right.appendChild(cont);
		var time = document.createElement("p");
		time.className = "goods-eval-time forum-cont-time";
		time.innerHTML = "发表于：" + goods[i].subdate;
		right.appendChild(time);
		var a = document.createElement("a");
		a.innerHTML = " &nbsp;回复(0) ";
		a.className = "forum-reply";
		time.appendChild(a);
		//添加回复列表
		var entryReply = document.createElement("ul"); //回复部分
		entryReply.className = "forum-cont-reply";
		right.appendChild(entryReply); 
		a.onclick = (function(ele, re, mid){
			return function(){
				if (re.innerHTML.indexOf("收起") != -1){ //已显示回复内容
					ele.style.maxHeight = "0px";
					//当已显示回复框时，移除回复框
					if (ele.getElementsByClassName("forum-replay-container")[0] != undefined){
						ele.removeChild(ele.getElementsByClassName("forum-replay-container")[0]);
					}
					var n = ele.getElementsByTagName("li").length;
					re.innerHTML = " &nbsp;回复(" + n + ") ";
				} else {
					ele.style.maxHeight = "1000px";
					re.innerHTML = " &nbsp;收起回复 ";
					addReply(ele, mid);
				}
			};
		})(entryReply, a, goods[i].mid);
	}
	for (var j = message.length-1; j >= 0; j--){
        var sub = message[j];
		//定位需挂载的根节点
		var parent = $("#forum-entry"+sub.reply);
		while (parent != undefined && parent.reply != "0"){ //倒退找到不是回复节点的祖先
		    parent = $("#forum-entry"+parent.reply);
		}
		//若需挂载的节点未显示则结束当前轮
		if (parent == undefined){ continue; }
        var subentry = document.createElement('li');
		subentry.className = "forum-subEntry TClearfix";
		subentry.id = "forum-entry" + sub.mid;
		subentry.reply = sub.reply;
		var left = document.createElement("div");
		left.className = "forum-sub-left";
		subentry.appendChild(left);
		var img = document.createElement("img");
		img.className = "forum-sub-icon";
		img.src = "../images/icons/icon" + sub.uid + ".png?ver="+Math.random();
		left.appendChild(img);
		var uname = document.createElement("p");
		uname.className = "goods-eval-uname forum-sub-uname";
		uname.innerHTML = sub.uname;
		left.appendChild(uname);
		var right = document.createElement("div");
		right.className = "forum-sub-right";
		subentry.appendChild(right);
		var cont = document.createElement("p");
		cont.className = "forum-sub-cont";
		cont.innerHTML = sub.content;
		right.appendChild(cont);
		var time = document.createElement("p");
		time.className = "goods-eval-time forum-cont-time";
		time.innerHTML = "发表于：" + sub.subdate;
		right.appendChild(time); 
		var a = document.createElement("a");
		a.innerHTML = " &nbsp;回复 ";
		a.className = "forum-reply";		
		time.appendChild(a);
		a.onclick = (function(ele, name, mid){
			return function(){
				addReply(ele.getElementsByClassName("forum-cont-reply")[0], mid, name);
			};
		})(parent, sub.uname, sub.mid);
		//添加收起回复
		if (parent.getElementsByTagName("li").length == 0){
			var time = parent.getElementsByClassName("forum-cont-time")[0];
			var a = time.getElementsByTagName("a")[0];
			a.innerHTML = " &nbsp;收起回复 ";
			a.onclick = (function(ele, re){
				return function(){
					var replyul = ele.getElementsByClassName("forum-cont-reply")[0];
					if (re.innerHTML.indexOf("收起") != -1){ //已显示回复内容
						replyul.style.maxHeight = "0px";
						//当已显示回复框时，移除回复框
						if (replyul.getElementsByClassName("forum-replay-container")[0] != undefined){
							replyul.removeChild(replyul.getElementsByClassName("forum-replay-container")[0]);
						}
						var n = replyul.getElementsByTagName("li").length - 1;
						re.innerHTML = " &nbsp;回复(" + n + ") ";
					} else {
						replyul.style.maxHeight = "1000px";
						re.innerHTML = " &nbsp;收起回复 ";
					}
				};
			})(parent, a);
			var li = document.createElement("li");
			li.className = "forum-reply-button TClearfix";
			parent.getElementsByClassName("forum-cont-reply")[0].appendChild(li);
			var button = document.createElement('input');
			button.type = "button";
			button.value = "我也说一句";
			button.className = "TB01-button TB01-white button09";
			button.onclick = (function(ele, mid){
				return function(){
					var text = ele.getElementsByClassName("forum-cont-reply")[0].getElementsByClassName("forum-reply-text");
					if (text.length == 0){
						addReply(ele.getElementsByClassName("forum-cont-reply")[0], mid);
					} else {
						if (text[0].value != 0){ //存在回复姓名
							text[0].value = "";
							text[0].reply = mid; //变更回复对象
						} else {
							ele.getElementsByClassName("forum-cont-reply")[0].removeChild(text[0].parentNode);
						}
					}
				}
			})(parent, parent.id.slice(11));
			li.appendChild(button);
		}
		var rep = parent.getElementsByClassName("forum-cont-reply")[0];
		var but = rep.getElementsByClassName("forum-reply-button")[0];
		rep.insertBefore(subentry, but);
	}
}

//添加回复框
function addReply(ele, mid, name){
	var textarea = ele.getElementsByClassName("forum-reply-text")[0];
	if (textarea == undefined){
		var li = document.createElement('li');
		li.className = "forum-replay-container";
		ele.appendChild(li);
		var text = document.createElement('textarea');
		text.className = "forum-reply-text";
		text.onkeyup = function(e){
			alterNum(e.target, 400)
		};
		text.onpaste = function(e){
			alterNum(e.target, 400)
		}
		if (name != undefined){
			text.value = "回复 " + name + "：";
		}
		text.reply = mid;
		li.appendChild(text);
		var tip = document.createElement('p');
		tip.className = "com-eval-numTip forum-numTip";
		tip.innerHTML = "您还可以输入 <span class='com-word-num'>400</span> 字";
		li.appendChild(tip);
		var submit = document.createElement('input');
		submit.type = "button";
		submit.value = "发 表";
		submit.className = "TB02 TB02-cyan button08";
		submit.onclick = function(){
			//检测登陆
			if (!checkLogin()){ return; }
			//检测输入
			if (text.value == ""){ 
				tip.innerHTML = "内容不能为空！";
				tip.style.color = "#f00";
				return;
			}
			var color = TFunc.getStyle(tip).color;
			if (color == "#f00" || color == "#ff0000" || color == "rgb(255, 0, 0)"){ return; }
			addMessage(text.reply, text.value); //新增消息
		}
		li.appendChild(submit);
	} else {
		textarea.reply = mid;
		if (name != undefined){ //只更改回复人姓名
			textarea.value = "回复 " + name + "：";
		}
	}
}

//新增消息
function addMessage(reply, content){
	var url = "../php/addMessage.php?uid="+sessionStorage.getItem("uid")+"&reply="+reply+"&content="+content+"&subdate="+(new Date()).shortFormat();
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
    ajaxReq.send("GET", url, true, addMessageHandler, "application/x-www-form-urlencoded; charset=UTF-8");
}

//新增消息回调函数
function addMessageHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    var str = ajaxReq.getResponseText().Trim();
		var state = str.slice(0,1);
		if (state == "1"){
		    window.location.reload(true);
		} 
	}
}