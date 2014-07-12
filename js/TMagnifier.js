/** ------------------------------------------------------------------------------
* TMagnifier
* @version 1.0
* @Explain 用于图片放大
* @author  alwaysonlinetxm
* @email   txm19921005@126.com
* PS: 在FF中必须将预览canvas的position设为absolute或relative
* 外部API:
* TMagnifier(pl, rl, pcan, rcan);    构造函数
* loadImg(src);                      载入图片
* --------------------------------------------------------------------------------
*/

//参数为预览canvas和结果canvas的边长和元素本身
function TMagnifier(pl, rl, pcan, rcan){  
    var self = this;
    self.PLength = pl ? pl : 450;                       //预览canvas和结果canvas边长,，默认为450和160      
    self.RLength = rl ? rl : 160;
	self.PCanvas = pcan;                                //预览canvas和结果canvas
	self.RCanvas = rcan;
    self.preImg = {x:0,y:0,w:0,h:0};                    //预览部分图片的起始点和长宽
	self.selectPart = {x:0,y:0,l:0};                    //选中部分的起始点以及边长
	self.scale = 1;                                     //图片在预览canvas中的尺寸与实际尺寸的比值
	self.img = null;                                    //待显示的图片对象
    //初始化
	self.init();	
}

TMagnifier.prototype = {
	init: function(){ //初始化函数
		var self = this;
		//注册鼠标事件，放在构造函数中注册保证一个对象只注册一次
		var context = self.PCanvas.getContext('2d');
		TFunc.on(self.PCanvas, 'mousemove', function(e){ self.onMove(e, context); });
		TFunc.on(self.PCanvas, 'mouseout', function(){ self.drawSelectRect(context, 0, 0, 0); });   
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
	        self.scale = self.PLength / self.img.width; //计算放大倍数
		    self.preImg.x = 0;
		    self.preImg.y = Math.floor((self.PLength - self.scale*self.img.height)/2);
	    } else {
	        self.scale = self.PLength / self.img.height; //计算放大倍数
		    self.preImg.x = Math.floor((self.PLength - self.scale*self.img.width)/2);
		    self.preImg.y = 0;
	    }
		self.selectPart.l = Math.floor(self.RLength*self.scale);
		self.preImg.w = Math.floor(self.img.width*self.scale);
	    self.preImg.h = Math.floor(self.img.height*self.scale);
		//绘制预览图及默认选中框
		self.drawSelectRect(context, self.preImg.x, self.preImg.y, self.selectPart.l); 
    },
	onMove: function(e, context){
		var self = this; 
	    //鼠标移动时位于canvas中的坐标
	    var x = e.offsetX || e.layerX;
		var y = e.offsetY || e.layerY;
		//超出图片范围则取消选中框
		if (x < self.preImg.x || x > self.preImg.x+self.preImg.w || y < self.preImg.y || y > self.preImg.y+self.preImg.h){
		    self.drawSelectRect(context, 0, 0, 0);
			return;
		}
		//选中框边长的一半
		var hl = Math.floor(self.selectPart.l/2);
		var sx = x - hl, sy = y - hl;
		if (x-self.preImg.x < hl) sx = self.preImg.x;
		if (self.preImg.x+self.preImg.w-x < hl) sx = self.preImg.x+self.preImg.w-self.selectPart.l;
		if (y-self.preImg.y < hl) sy = self.preImg.y;
		if (self.preImg.y+self.preImg.h-y < hl) sy = self.preImg.y+self.preImg.h-self.selectPart.l;
		self.drawSelectRect(context, sx, sy, self.selectPart.l); 
	},
	drawSelectRect: function(context, x, y, l){
	    var self = this;
		//记录裁剪框的位置和长宽
        self.selectPart.x = x;    
	    self.selectPart.y = y;
		//清空之前的图像, 并将图片绘至预览canvas
		context.clearRect(0, 0, self.PLength, self.PLength);  
	    context.drawImage(self.img, self.preImg.x, self.preImg.y, self.preImg.w, self.preImg.h);
		//绘制选中框
		context.fillStyle = "rgba(255, 255, 255, 0.4)";
	    context.fillRect(x, y, l, l);
	    //绘制结果图像
		var realx = Math.floor((x-self.preImg.x)/self.scale);
	    var realy = Math.floor((y-self.preImg.y)/self.scale);
	    var reall = Math.floor(self.selectPart.l/self.scale);
	    self.RCanvas.getContext('2d').drawImage(self.img, realx, realy, reall, reall, 0, 0, self.RLength, self.RLength);
    }
};