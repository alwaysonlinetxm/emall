//购物车信息缓存数组
var cartInfo = new Array();
//购物车信息类
function CartInfo(gid, gdis, gprice, gfare, gnum, gstock){
  this.gid = gid;
  this.gdis = gdis;
  this.gprice = gprice;
  this.gfare = gfare;
  this.gnum = gnum;
  this.gstock= gstock;
}

//初始化购物车表格
function initCartTable(){
	checkLogin(); //检测登陆 未登录则跳转到登陆页面
	
	var url = "../php/getCartInfo.php?uid=" + sessionStorage.getItem("uid");
	url = encodeURI(encodeURI(url)); //编码，避免传送时乱码
    ajaxReq.send("GET", url, true, function(){ getXMLHandler(cartInfoHandler); }, "application/x-www-form-urlencoded;charset=UTF-8"); 
}

//处理取回的购物车信息
function cartInfoHandler(){
    if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
	    //储存相应的xml内容
		var xmlData = ajaxReq.getResponseXML().getElementsByTagName("data")[0];
		//获取个条信息
        var entries = xmlData.getElementsByTagName("entry");
		//清除原缓存信息
		while (cartInfo.length) cartInfo.pop();
		//当长度不为0时才有信息添加信息添加
		if (entries.length != 0){
		    for (var i = 0; i < entries.length; i++) {
				//创建信息节点
				var item = {gid:"gid", gdis:"gdis", gprice:"gprice", gfare:"gfare", gnum:"gnum", gstock:"gstock"};
				for (var key in item){			    
					item[key] = getText(entries[i].getElementsByTagName(item[key])[0]);
				}
				cartInfo.push(new CartInfo(item["gid"],item["gdis"],item["gprice"],item["gfare"],item["gnum"],item["gstock"]));
			}
			$(".com-number")[0].innerHTML = cartInfo.length;
			showCartInfo();//显示购物车信息
		} else {
			$(".cart-table")[0].innerHTML = "<div style='margin:20px auto;width:255px;' class='com-blankTip'><img src='../images/cart.png' class='com-imgTip'>你的购物车里还没有任何商品。</div>";
		}
		getRecom(encodeURI(encodeURI("../php/getRecom.php?num=4")));//获取推荐项
	}
}

//显示购物车信息
function showCartInfo(){
	var tr = $(".cart-table")[0].getElementsByTagName("tr");
	while (tr.length > 1) { $(".cart-table")[0].removeChild(tr[1]); } //移除之前的痕迹
	for (var i = 0; i < cartInfo.length; i++){		
		var tr = document.createElement("tr");
		tr.className = "com-table-item";
		$(".cart-table")[0].appendChild(tr);
		//选择
		var td = document.createElement("td");
		tr.appendChild(td);
		var check = document.createElement("input");
		check.type = "checkbox";
		check.name = cartInfo[i].gid;
		check.onchange = function(){
			if ($("#cart-select-all").checked) { $("#cart-select-all").checked = false; }
			countSum(); // 选择变化时改变总价
		}
		td.appendChild(check);
		//商品
		td = document.createElement("td");
		td.className = "cart-goods";
		tr.appendChild(td);
		var a = document.createElement("a");
		a.className = "com-cart-infoa";
		a.name = cartInfo[i].gid;
		a.onclick = (function(str){
			return function(){
				window.open(PATH+"html/showGoods.html?"+str);
			}
		})(a.name);
		td.appendChild(a);
		var img = document.createElement("img");
		img.className = "com-cart-img";
		img.src = "../images/cover/"+cartInfo[i].gid+".jpg";
		a.appendChild(img);
		var span = document.createElement("span");
		span.className = "com-cart-infodis";
		span.innerHTML = cartInfo[i].gdis;
		a.appendChild(span);
		//单价
		td = document.createElement("td");
		td.innerHTML = (cartInfo[i].gprice*1).toFixed(2);
		tr.appendChild(td);
		//数量 
		td = document.createElement("td");
		tr.appendChild(td);
		var num = document.createElement("input");
		num.type = "text";
		num.className = "goods-bnum";
		num.value = cartInfo[i].gnum;
		var tip = document.createElement("p");
		tip.className = "cart-bnumTip com-tip-check";
		tip.innerHTML = "库存 "+cartInfo[i].gstock+" 件";
		num.onfocus = (function(stock, num, tip){ 
			return function(){
				var value = num.value;
				if (!(value.match(/^[0-9]*$/g) != null && value*1 > 0 && value*1 <= stock)){
					num.value = "1"; 
				}
				tip.innerHTML = "库存 " + stock + " 件";
				tip.style.color = "#aaa";
			};
		})(cartInfo[i].gstock*1, num, tip);
		num.onblur = (function(stock, num, tip){ 
			return function(e){
				var value = num.value;
				if (!(value.match(/^[0-9]*$/g) != null && value*1 > 0 && value*1 <= stock)){
					tip.innerHTML = "请正确填写数量！";
					tip.style.color = "#f00";
				} else { //更改小计数值
					var price = e.target.parentNode.previousSibling.innerHTML*1;
					var fare = e.target.parentNode.nextSibling.innerHTML*1;
					e.target.parentNode.nextSibling.nextSibling.innerHTML = (price*value + fare).toFixed(2);
					countSum();
				}
			}
		})(cartInfo[i].gstock*1, num, tip);
		td.appendChild(num);
		td.appendChild(tip);
		//运费
		td = document.createElement("td");
		td.innerHTML = (cartInfo[i].gfare*1).toFixed(2);
		tr.appendChild(td);
		//小计
		td = document.createElement("td");
		td.className = "cart-part";
		td.innerHTML = (cartInfo[i].gprice*cartInfo[i].gnum+cartInfo[i].gfare*1).toFixed(2);
		tr.appendChild(td);
		//操作
		td = document.createElement("td");
		tr.appendChild(td);
		var add = document.createElement("p")
		add.innerHTML = "加入收藏夹";
		add.className = "cart-operation";
		add.onclick = (function(gid){ 
			return function(){
				addGoods("coll", gid, "成功添加！已将该商品加入您的收藏夹。", "该商品已在您的收藏夹中了。");
			}
		})(check.name);
		td.appendChild(add);
		var dele = document.createElement("p")
		dele.innerHTML = "删除";
		dele.className = "cart-operation";
		dele.onclick = (function(gid){ 
			return function(){
				deleGoods("cart", gid, deleCartHandler);
			}
		})(check.name);
		td.appendChild(dele);
	}
}

//全选框改变时出发的动作
function selectChange(){
	var select = $("#cart-select-all").checked;
	var tr = $(".cart-table")[0].getElementsByTagName("tr");
	for (var i = 1; i < tr.length; i++){
		tr[i].getElementsByTagName("input")[0].checked = select;
	}
	countSum();
}

//计算总价
function countSum(){
	var sum = 0;
	for (var i = 0; i < $(".cart-part").length; i++){
		var checked = $(".cart-part")[i].parentNode.getElementsByTagName("input")[0].checked;
		if (checked) { sum += $(".cart-part")[i].innerHTML*1; }
	}
	$(".cart-sum")[0].innerHTML = "￥ " + sum.toFixed(2);
}

//批量删除
function sizeDelete(){
	var gid = getSelectedID();
	if (gid == "") return; //没有选中任何商品
	gid = gid.slice(0, -1);
	deleGoods("cart", gid, deleCartHandler);
}

//批量加入收藏夹
function sizeAddColl(){
	var gid = getSelectedID();
	if (gid == "") return; //没有选中任何商品
	gid = gid.slice(0, -1);
	addGoods("coll", gid, "成功添加！已将该商品加入您的收藏夹。", "该商品已在您的收藏夹中了。");
}

//获取选中物品id
function getSelectedID(){
	var tr = $(".cart-table")[0].getElementsByTagName("tr");
	var gid = "";
	for (var i = 1; i < tr.length; i++){
		if (tr[i].getElementsByTagName("input")[0].checked){
			gid += tr[i].getElementsByTagName("input")[0].name + "|";
		}
	}
	return gid;
}

//结算
function account(){
	if (!checkTip()){ return; }; //检测输入框是否合法
	var tr = $(".cart-table")[0].getElementsByTagName("tr");
	var info = "";
	for (var i = 1; i < tr.length; i++){
		if (tr[i].getElementsByTagName("input")[0].checked){
			var td = tr[i].getElementsByTagName("td");
			var gid = td[1].getElementsByTagName("a")[0].name;
			var gnum = td[3].getElementsByTagName("input")[0].value;
			info += gid + "|" + gnum + "&";
		}
	}
	if (info != ""){
		info = info.slice(0, -1);
	} else {
		$(".cart-goods-tip")[0].style.display = "inline-block";
		return;
	}
	window.location.href = "bill.html?" + info;
}