//初始化订单信息
function initBill(){
	checkLogin();
	var bills = window.location.search.slice(1).split("&");
	var url = "../php/getBillGoods.php?gid=";
	for (var i = 0; i < bills.length; i++){
		url += bills[i].split("|")[0]+"|";
	}
	url = url.slice(0, -1);  //去除最后的“|”
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ billGoodsHandler(bills); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//订单商品信息回调函数
function billGoodsHandler(bills){
	if(ajaxReq.getReadyState() === 4 && ajaxReq.getStatus() === 200){
		var str = ajaxReq.getResponseText().Trim();
		var items = str.split("&");
		for (var i = 0; i < items.length; i++){
			var info = items[i].split("|");
			var bill = bills[i].split("|");
			var tr = document.createElement("tr");
			tr.className = "com-table-item";
			$(".bill-table")[0].appendChild(tr);
			//商品
			var td = document.createElement("td");
			td.className = "cart-goods";
			tr.appendChild(td);
			var a = document.createElement("a");
			a.className = "com-cart-infoa";
			a.name = bill[0];
			a.onclick = (function(str){
				return function(){
					window.open(PATH+"html/showGoods.html?"+str);
				}
			})(a.name);
			td.appendChild(a);
			var img = document.createElement("img");
			img.className = "com-cart-img";
			img.src = "../images/cover/"+bill[0]+".jpg";
			a.appendChild(img);
			var span = document.createElement("span");
			span.className = "com-cart-infodis";
			span.innerHTML = info[0];
			a.appendChild(span);
			//单价
			td = document.createElement("td");
			td.innerHTML = (info[1]*1).toFixed(2);
			tr.appendChild(td);
			//数量 
			td = document.createElement("td");
			tr.appendChild(td);
			var num = document.createElement("input");
			num.type = "text";
			num.className = "goods-bnum";
			num.value = bill[1];
			var tip = document.createElement("p");
			tip.className = "cart-bnumTip com-tip-check";
			tip.innerHTML = "库存 "+info[3]+" 件";
			num.onfocus = (function(stock, num, tip){ 
				return function(){
					var value = num.value;
					if (!(value.match(/^[0-9]*$/g) != null && value*1 > 0 && value*1 <= stock)){
						num.value = "1"; 
					}
					tip.innerHTML = "库存 " + stock + " 件";
					tip.style.color = "#aaa";
				};
			})(info[3]*1, num, tip);
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
						countBillSum();
					}
				}
			})(info[3]*1, num, tip);
			td.appendChild(num);
			td.appendChild(tip);
			//运费
			td = document.createElement("td");
			td.innerHTML = (info[2]*1).toFixed(2);
			tr.appendChild(td);
			//小计
			td = document.createElement("td");
			td.className = "cart-part";
			td.innerHTML = (info[1]*bill[1]+info[2]*1).toFixed(2);
			tr.appendChild(td);
		}
		countBillSum(); //计算总价
		initBillAddress(); //初始化地址信息
	}
}

//初始化订单地址信息
function initBillAddress(){
	var url = "../php/getAddress.php?uid="+sessionStorage.getItem("uid");
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ getXMLHandler(function(){addressHandler(showBillAddress, showAddNew); }); }, "application/x-www-form-urlencoded; charset=UTF-8");
}

//显示已有订单地址
function showBillAddress(){
	var ul = $(".bill-address")[0];
	var lis = ul.getElementsByTagName("li"); 
	while (lis.length > 1) ul.removeChild(lis[1]); //先清空之前的数据
	for (var i = 0; i < goods.length; i++){
		var li = document.createElement("li");
		if (goods[i].adefault == "1") { li.className = "bill-address-selected"; } 
		li.id = goods[i].aid;
		ul.appendChild(li);
		var input = document.createElement("input");
		input.type = "radio";
		input.name = "bill-address";
		input.id = "bill-address" + i;
		input.style.margin = "0 20px";
		input.onchange = function(e){
			if (e.target.checked){
				var li = e.target.parentNode.parentNode.getElementsByTagName("li");
				for (var j = 0; j < li.length; j++){
					li[j].className = "";
				}
			}
			e.target.parentNode.className = "bill-address-selected";
		}
		if (goods[i].adefault == "1") { input.checked = true; }
		li.appendChild(input);
		var label = document.createElement("label");
		label.innerHTML = goods[i].aregion + " " + goods[i].astreet + " " + goods[i].apost + " " + goods[i].aperson + "(收) " +goods[i].amobile;
		label.setAttribute("for", input.id);
		li.appendChild(label);
		var alter = document.createElement("a");
		alter.innerHTML = "修改";
		alter.onclick = (function(addr){
			return function(){
				editID = addr.aid;//记录本次修改的地址ID
				$(".com-address-person")[0].value = addr.aperson;
				var regions = addr.aregion.split(" ");
				address = new TAddress($('#com-province'), $('#com-city'), $('#com-area'), regions[0], regions[1], regions[2]);
				$(".com-address-street")[0].value = addr.astreet;
				$(".com-address-post")[0].value = addr.apost;
				$(".com-address-mobile")[0].value = addr.amobile;
				$(".bill-address-new")[0].style.maxHeight = "500px";
				$("#com-address-default").checked = true; //默认将新增或修改的地址将设为默认
			}
		})(goods[i]);
		li.appendChild(alter);
		var adefault = document.createElement("a");
		if (goods[i].adefault == "1"){
			adefault.innerHTML = "默认地址";
			adefault.style.color = "#00f";
		} else {
			adefault.innerHTML = "设为默认";
			adefault.onclick = function(e){
				setDefaultAddress(e.target.parentNode.id, window.location.href);
			}
		}
		li.appendChild(adefault);		
	}
}

//显示添加新地址部分
function showAddNew(){
	if (TFunc.getStyle($(".bill-address-new")[0]).maxHeight == "60px"){
		$(".bill-address-new")[0].style.maxHeight = "500px"
	} else {
		$(".bill-address-new")[0].style.maxHeight = "60px";
	}
	$("#com-address-default").checked = true; //默认将新增或修改的地址将设为默认
	//省市区选择控件初始化
	address = new TAddress($('#com-province'), $('#com-city'), $('#com-area'));
}

//计算商品总价
function countBillSum(){
	var sum = 0;
	var tr = $(".bill-table")[0].getElementsByTagName("tr");
	for (var i = 1; i < tr.length; i++){
		sum += tr[i].getElementsByTagName("td")[4].innerHTML*1; 
	}
	$(".cart-sum")[0].innerHTML = "￥ " + sum.toFixed(2);
}

//提交订单
function submitBill(){
	if (!checkTip()){ return; }; //检测输入框是否合法
	//先检测地址信息是否已经确认
	var li = $(".bill-address")[0].getElementsByTagName("li");
	var address = false;
	for (var i = 0; i < li.length; i++){
		if (li[i].getElementsByTagName("input")[0].checked) { address = true; }
	}
	if (!address){
		$(".bill-address-tip")[0].style.display = "inline-block";
		return;
	}
	var tr = $(".bill-table")[0].getElementsByTagName("tr");
	var info = "";
	for (var j = 1; j < tr.length; j++){
		var td = tr[j].getElementsByTagName("td");
		var gid = td[0].getElementsByTagName("a")[0].name;
		var gnum = td[2].getElementsByTagName("input")[0].value;
		info += gid + "|" + gnum + " ";
	}
	var url = "../php/submitBill.php?uid="+sessionStorage.getItem("uid")+"&goods="+info.slice(0, -1);
	url += "&time=" + (new Date()).shortFormat(); //记录下单时间
	url = encodeURI(encodeURI(url));//编码，避免传送时乱码	
	ajaxReq.send("GET", url, true, function(){ resultHandler("订单提交成功！", "抱歉，订单提交失败，请刷新重试。", "user.html?bill"); }, "application/x-www-form-urlencoded; charset=UTF-8");
}