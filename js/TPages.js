/** ------------------------------------------------------------------------------
* TPages
* @version 1.0
* @Explain 用于分页导航
* @author  alwaysonlinetxm
* @email   txm19921005@126.com
* PS: 需配合固定的标签组合, 传入的show函数会获得当前号作为参数，从1开始
* 外部API: 
* TPages(ele, num, show, currentStyle, current)  构造函数
* --------------------------------------------------------------------------------
*/

//显示分页导航 参数是分页组件ul元素,需要的页数,显示函数,选中样式,默认显示的页号
function TPages(ele, num, show, currentStyle, current){
	var self = this;
	self.ele = ele;               			  //分页组件ul元素
	self.num = num;               			  //需要的页数
	self.show = show;                         //显示调用函数
	self.currentStyle = currentStyle;         //选中样式
	self.current = current ? current*1 : 1;   //当前显示页号
	//初始化
	self.init();
}

TPages.prototype = {
	init: function(){ //初始化
		var self = this;
		var li = self.ele.getElementsByTagName("li");
		var len = li.length; //缓存长度，因为长度会随着删除而变化
		for (var j = 0; j < len-4; j++){ self.ele.removeChild(li[2]); } //删除之前的分页痕迹
		var a = self.ele.getElementsByTagName("a");
		TFunc.on(a[0], 'click', function(){ 
			self.show(self.current = 1); 
			self.setPageBg();
		});
		TFunc.on(a[1], 'click', function(){ 
			self.show(self.current-1 >= 1 ? --self.current : 1); 
			self.setPageBg();
		});
		TFunc.on(a[2], 'click', function(){ 
			self.show(self.current+1 <= self.num ? ++self.current : self.num); 
			self.setPageBg();
		});
		TFunc.on(a[3], 'click', function(){ 
			self.show(self.current = self.num); 
			self.setPageBg();
		});
		for (var i = 0; i < self.num; i++){
			var nli = document.createElement("li");		
			self.ele.insertBefore(nli, li[li.length-2]);
			var na = document.createElement("a");
			na.href = "#";
			na.innerHTML = i + 1;
			TFunc.on(na, 'click', function(e){ 
				self.show(self.current = e.target.innerHTML*1); 
				self.setPageBg();
			});
			nli.appendChild(na);			
		}
		self.setPageBg();
	},
	setPageBg: function(){ //设置选中页项背景
		var self = this;
		var a = self.ele.getElementsByTagName("a");
		for (var j = 2; j < a.length-2; j++){
			if (j-1 == self.current) {
				TFunc.addClass(a[j], self.currentStyle);
			} else {
				TFunc.removeClass(a[j], self.currentStyle);
			}
		}
	}
}
