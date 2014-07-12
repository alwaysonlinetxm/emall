/** ------------------------------------------------------------------------------
* TImgClip
* @version 1.0
* @Explain 用于图片裁剪，本地选择图片预览，拖动裁剪框进行图片裁剪
* @author  alwaysonlinetxm
* @email   txm19921005@126.com
* PS: 在FF中必须将预览canvas的position设为absolute或relative，暂不支持IE文件读取
* 外部API:
* TImgClip(pl, rl, pcan, rcan);     构造函数
* loadImg(file);                    载入图片文件
* toBase64();                       将结果canvas内容转为base64字符串
* --------------------------------------------------------------------------------
*/

//参数为预览canvas和结果canvas的边长以及元素本身
function TImgClip(pl, rl, pcan, rcan){  
    var self = this;
    self.PLength = pl;                 //预览canvas和结果canvas边长,，默认为450和160      
    self.RLength = rl;
	self.PCanvas = pcan;               //预览canvas和结果canvas
	self.RCanvas = rcan;
    self.preImg = {x:0,y:0,w:0,h:0};   //预览部分图片的起始点和长宽
    self.clipPart = {x:0,y:0,w:0,h:0}; //裁剪框的起始点和边长
    self.clipStart = {x:0,y:0};        //裁剪起始点
    self.resize = {x:0,y:0,l:10};      //尺寸调整框的起始点和边长，默认为10
	self.lastClip = {x:0,y:0};         //裁剪框拖动时前一次鼠标的位置
    self.isClip = false;               //判断是否开始裁剪
    self.isDrag = false;               //判断是否开始拖动
	self.scale = 1;                    //图片在预览canvas中的尺寸与实际尺寸的比值
	self.img = null;                   //显示的图片对象
	//初始化
	self.init();
}

TImgClip.prototype = {
	init: function(){ //初始化函数
		var self = this;
		//注册鼠标事件，放在构造函数中注册保证一个对象只注册一次
		var context = self.PCanvas.getContext('2d');
		TFunc.on(self.PCanvas, 'mousedown', function(e){ self.onDown(e, context); });
		TFunc.on(document, 'mouseup', function(){ self.isClip = false; self.isDrag = false; });
		TFunc.on(self.PCanvas, 'mousemove', function(e){ self.onMove(e, context); });
		TFunc.on(self.PCanvas, 'mouseout', function(){ self.onOut(context); });	
		//将预览canvas元素设置为禁止选中
		self.PCanvas.onselectstart = function(){
			return false;
		};
	},
    loadImg: function(file){ //图片导入函数，参数是file元素或是图片的相对url
	    var self = this;
	    self.img = new Image();
		if (typeof file == "object"){ //支持文件读取 firefox,chrome下会隐藏文件路径
			if (window.FileReader != undefined){
				var reader = new FileReader();   
				reader.onload = function(e){ 
					//e.target.result返回的即是图片的dataURI格式的内容			
					self.img.src = e.target.result;  
				}  
				//该方法会将图片文件内容转换成dataURI的格式，而该格式是可以直接在浏览器中显示的。
				reader.readAsDataURL(file.files[0]); 
			} else { //IE下不隐藏文件路径，所以直接以value作为路径
				//由于同源关系，只能在本地使用
				self.img.src = file.value;
			}
	    } else if (typeof file == "string"){ //传入的是图片路径
			self.img.src = file;
		}; 
		self.img.onload = function(){		
	        self.drawPreview(self.PCanvas.getContext('2d'));			
        };
	},
	drawPreview: function(context){
	    var self = this;    
		//计算出比值，并根据比值计算图片在预览canvas中的起始点及长宽
		if (self.img.width > self.img.height){  
	        self.scale = self.PLength / self.img.width;
		    self.preImg.x = 0;
		    self.preImg.y = Math.floor((self.PLength - self.scale*self.img.height)/2);
	    } else {
	        self.scale = self.PLength / self.img.height;
		    self.preImg.x = Math.floor((self.PLength - self.scale*self.img.width)/2);
		    self.preImg.y = 0;
	    }
		self.preImg.w = Math.floor(self.img.width*self.scale);
	    self.preImg.h = Math.floor(self.img.height*self.scale);
		//绘制预览图及默认裁剪边框
		self.drawClipRect(context, self.preImg.x, self.preImg.y, self.RLength, self.RLength); 
    },
	onDown: function(e, context){
		var self = this;  
	    //鼠标单击位置位于canvas中的坐标，以预览canvas左上角为原点
	    var x = self.clipStart.x = e.offsetX || e.layerX;
		var y = self.clipStart.y = e.offsetY || e.layerY;
		//判断是否在预览canvas中的图片范围内
	    if (x >= self.preImg.x && x <= self.preImg.x+self.preImg.w && y >= self.preImg.y && y <= self.preImg.y+self.preImg.h){
			//计算拖动框的边界
			var border = self.dragBorder();
			//判断是重新裁剪, 拖动还是调整尺寸
			if (x >= self.resize.x && x <= self.resize.x+self.resize.l && y >= self.resize.y && y <= self.resize.y+self.resize.l){
				//当调整尺寸时，与重新裁剪相同处理，只需更新裁剪框的绘制起点为裁剪框左上角即可
				self.isClip = true;  
				self.isDrag = false;
				self.clipStart.x = border.minx; 
			    self.clipStart.y = border.miny;
			} else if (x < border.minx || x > border.maxx || y < border.miny || y > border.maxy){
		        self.isClip = true;  
				self.isDrag = false;
				//清空之前的图像, 并将图片绘至预览canvas
		        context.clearRect(0, 0, self.PLength, self.PLength);  
	            context.drawImage(self.img, self.preImg.x, self.preImg.y, self.preImg.w, self.preImg.h);
				self.clipPart = {x:0,y:0,w:0,h:0}; //将之前的拖动框数据清空
			} else {
			    self.isDrag = true;
				self.isClip = false;
				self.lastClip.x = x;
				self.lastClip.y = y;					
			}
		}
	},
	onMove: function(e, context){
		var self = this;  
	    //鼠标移动时位于canvas中的坐标
	    var x = e.offsetX || e.layerX;
		var y = e.offsetY || e.layerY;
		if (self.isClip){  //开始裁剪
			//拖动的距离差
			var dx = x-self.clipStart.x, dy = y-self.clipStart.y;
			//计算长宽的上下限
			var minw = self.preImg.x-self.clipStart.x, maxw = self.preImg.x+self.preImg.w-self.clipStart.x;
			var minh = self.preImg.y-self.clipStart.y, maxh = self.preImg.y+self.preImg.h-self.clipStart.y;
			//超出界限则调整为界限值
			if (dx < minw) dx = minw;
			if (dx > maxw) dx = maxw;
			if (dy < minh) dy = minh;
			if (dy > maxh) dy = maxh;
		    if (Math.abs(dx) < Math.abs(dy)){ //找出长和宽中的较小值，调整长款一致
				dy = (dy) * Math.abs(dx)/Math.abs(dy);
			} else {
			    dx = (dx) * Math.abs(dy)/Math.abs(dx);
			}
		    self.drawClipRect(context, self.clipStart.x, self.clipStart.y, dx, dy);
		} else if (self.isDrag){  //开始拖动
		    //计算此次移动距离
		    var dx = x - self.lastClip.x, dy = y - self.lastClip.y; 
			//计算拖动框的边界
			var border = self.dragBorder();
			//若移动超出范围则调整为边界值
			if (border.minx+dx < self.preImg.x) dx = self.preImg.x - border.minx;
			if (border.maxx+dx > self.preImg.x+self.preImg.w) dx = self.preImg.x + self.preImg.w - border.maxx;
			if (border.miny+dy < self.preImg.y) dy = self.preImg.y - border.miny;
			if (border.maxy+dy > self.preImg.y+self.preImg.h) dy = self.preImg.y + self.preImg.h - border.maxy;
			
			self.drawClipRect(context, self.clipPart.x+dx, self.clipPart.y+dy, self.clipPart.w, self.clipPart.h);
			self.lastClip.x = x;
			self.lastClip.y = y;
		} 
	},
	onOut: function(context){
		var self = this;  
	    if (self.isClip){ 
			//计算长宽的上下限
			var minw = self.preImg.x-self.clipStart.x, maxw = self.preImg.x+self.preImg.w-self.clipStart.x;
			var minh = self.preImg.y-self.clipStart.y, maxh = self.preImg.y+self.preImg.h-self.clipStart.y;
			//将拖动框调整为上下限
			if (self.clipPart.w < 0){ 
				self.clipPart.w = minw;
			} else {
				self.clipPart.w = maxw;
			}
			if (self.clipPart.h < 0){ 
				self.clipPart.h = minh;
			} else {
				self.clipPart.h = maxh;
			}
			if (Math.abs(self.clipPart.w) < Math.abs(self.clipPart.h)){ //找出长和宽中的较小值，调整长款一致
				self.clipPart.h = (self.clipPart.h) * Math.abs(self.clipPart.w)/Math.abs(self.clipPart.h);
			} else {
			    self.clipPart.w = (self.clipPart.w) * Math.abs(self.clipPart.h)/Math.abs(self.clipPart.w);
			}
		    self.drawClipRect(context,self.clipStart.x,self.clipStart.y,self.clipPart.w,self.clipPart.h,self.scale);
		}
	},
	drawClipRect: function(context, x, y, w, h){
	    var self = this;
		//记录裁剪框的位置和长宽
        self.clipPart.x = x;    
	    self.clipPart.y = y;
	    self.clipPart.w = w;
	    self.clipPart.h = h;
	    //计算尺寸调整框的起点
	    if (w < 0){
	        self.resize.x = x - self.resize.l/2;
	    } else {
	        self.resize.x = x + w - self.resize.l/2;
	    }
	    if (h < 0){
	        self.resize.y = y - self.resize.l/2;
	    } else {
	        self.resize.y = y + h - self.resize.l/2;
	    }
		//清空之前的图像, 并将图片绘至预览canvas
		context.clearRect(0, 0, self.PLength, self.PLength);  
	    context.drawImage(self.img, self.preImg.x, self.preImg.y, self.preImg.w, self.preImg.h);
		//添加暗屏效果
		context.fillStyle = "rgba(0, 0, 0, 0.4)";
	    context.fillRect(self.preImg.x, self.preImg.y, self.preImg.w, self.preImg.h);
        context.save();
		context.beginPath();
		context.rect(x, y, w, h);
		context.clip(); 
		context.closePath();
		context.drawImage(self.img, self.preImg.x, self.preImg.y, self.preImg.w, self.preImg.h);
		context.restore();
		//绘制裁剪框
	    context.lineWidth = 2;
	    context.strokeStyle = "#ff0";	
	    context.strokeRect(x, y, w, h);   
	    //绘制尺寸调整框
	    context.lineWidth = 1;
	    context.strokeStyle = "#000";
	    context.strokeRect(self.resize.x, self.resize.y, self.resize.l, self.resize.l);
	    context.fillStyle = "rgba(255, 255, 255, 0.8)";
	    context.fillRect(self.resize.x, self.resize.y, self.resize.l, self.resize.l);
	    //绘制裁剪结果图像
		var realx = Math.floor((x-self.preImg.x)/self.scale);
	    var realy = Math.floor((y-self.preImg.y)/self.scale);
	    var realw = Math.floor(w/self.scale);
	    var realh = Math.floor(h/self.scale);
		//Firefox与Opera中drawImage不支持负边长
		if (TFunc.browser() == "Firefox" || TFunc.browser() == "Opera"){
	        if (realw < 0){
		        realx += realw;
			    realw = -realw;
		    }
		    if (realh < 0){
		        realy += realh;
			    realh = -realh
		    }
	    }
	    self.RCanvas.getContext('2d').drawImage(self.img, realx, realy, realw, realh, 0, 0, self.RLength, self.RLength);
    },
	dragBorder: function(){   //计算拖动框的边界
	    var self = this;
		if (self.clipPart.w < 0){  
			var minx = self.clipPart.x+self.clipPart.w, maxx = self.clipPart.x;
		} else {
			var minx = self.clipPart.x, maxx = self.clipPart.x+self.clipPart.w;
		}
		if (self.clipPart.h < 0){
			var miny = self.clipPart.y+self.clipPart.h, maxy = self.clipPart.y;
		} else {
			var miny = self.clipPart.y, maxy = self.clipPart.y+self.clipPart.h;
		}
		return {minx: minx, maxx: maxx, miny: miny, maxy: maxy};
	},
	toBase64: function(){ //将结果canvas中的内容转为base64字符串并返回
		var self = this;
		var data = self.RCanvas.toDataURL(); 
		//删除字符串前的提示信息 "data:image/png;base64," 	
		data = data.substring(22);
		//将base64码里的“+”号改成"%2B"和“&”改成"%26" 因为在ajax传送时会把他们变成空格 毁坏了数据的正确性
		data = data.replace(/\&/g,"%26");
		data = data.replace(/\+/g,"%2B");
		
		return data;
	}
};
