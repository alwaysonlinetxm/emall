

//初始化首页
function initIndex(){
	//首页标签初始化
	initIndexType(); 
	//广告幻灯
	var slide = new TImgSlide($(".TSlide")[0], "left");
	slide.run();
	//获取推荐项
	getRecom(encodeURI(encodeURI("php/getRecom.php?num=4")));
}

//首页标签初始化
function initIndexType(){
	sessionStorage.setItem("type", "");
	sessionStorage.setItem("tag", "");
	sessionStorage.setItem("seq", "");
	sessionStorage.setItem("dis", "");
	var ul = document.getElementsByClassName("index-type");
	for (var i = 0; i < ul.length; i++){
		var a = ul[i].getElementsByTagName("a");
		for (var j = 0; j < a.length; j++){
			a[j].onclick = function(e){
				var attr = e.target.name.split("&"); 
				sessionStorage.setItem("type", attr[0]);
				sessionStorage.setItem("tag", attr[1]);
				sessionStorage.setItem("seq", attr[2]);
				sessionStorage.setItem("dis", attr[3]);
			}
		}
	}
}