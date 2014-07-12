/**
* TImgSlide
* @version 1.0
* @Explain 图片幻灯，缓动地切换图片，支持水平，竖直两种方式
* @author  原作者:artwl，改编：alwaysonlinetxm
* @email   txm19921005@126.com
* link: http://artwl.cnblogs.com
* PS: 需要导入TImgSlide.css文件，文件中的id及类名与html中的相应元素对应
* 外部API:
* TImgSlide(ele, direction, picwidth, picheight, speed, ease);    构造函数
* run();                                                          启动函数
*/

//参数是待显示的容器元素，图片切换方向，图片宽度和高度，切换时间间隔，使用的缓动公式
function TImgSlide(ele, direction, picwidth, picheight, speed, ease){
	var self = this;
    self.slideList = ele.getElementsByTagName("ul")[0];                     //待显示的图片列表
    self.slideNums = ele.getElementsByTagName("ul")[1].children;          //圆形标示，用children而不用childNodes为了只取<li>元素
    self.direction = direction || "left";              						//滑动方向
    self.picwidth = picwidth || parseFloat(TFunc.getStyle(ele).width);      //图片宽度
	self.picheight = picheight || parseFloat(TFunc.getStyle(ele).height);   //图片高度
	self.size = self.direction === "left" ? self.picwidth : self.picheight; //滑动时的单位长度    
	self.speed = speed || 5000;                        						//自动滑动的时间间隔
	self.ease = ease || TTween.easeOutCirc;           		 				//要使用的缓动公式
    self.currentIndex = 0;                             						//当前正显示的图片的标号
    self.distance = self.size;                         						//变化的距离
    self.currentPos = 0;                               						//当前的起始位置
    self.runHandle = null;                             						//自动滑动的定时器
    self.length = self.slideNums.length;               						//图片个数
}

TImgSlide.prototype = {
    bindMouse: function(){
        var self = this;
        for (var i = 0; i < self.length; i++){
			TFunc.on(self.slideNums[i], "mouseover", (function(index){
                return function(){
					self.currentIndex = index;
					clearInterval(self.runHandle);
					var prev = -1;
					for (var k = 0; k < self.length; k++){
						if (self.slideNums[k].className === "TCurrent") prev = k;
						self.slideNums[k].className = k === index ? "TCurrent" : "";
					}
					if(prev != index){
						self.distance = (prev-index) * self.size;
						self.currentPos = -prev * self.size;
						var attrs = {
						    field: self.direction,
						    begin: self.currentPos,
							change: self.distance,
							ease: self.ease
						};
						TTween.transition(self.slideList, attrs);	
					}
				}
			})(i));//为了将每次i的不同值传入
			TFunc.on(self.slideNums[i], "mouseout", function(){ self.autoRun();});
		}
    },
    autoRun: function(){
        var self=this;
        self.runHandle = setInterval(function(){
            self.distance = -self.size;
            for (var k = 0; k < self.length; k++) self.slideNums[k].className = "";
            self.currentIndex++;
            self.currentIndex %= self.length;
            self.slideNums[self.currentIndex].className = "TCurrent";
            self.currentPos = -(self.currentIndex-1) * self.size;
            if(self.currentIndex == 0){
                self.distance = (self.length - 1) * self.size;
                self.currentPos = -self.distance;
            }
			var attrs = {
				field: self.direction,
				begin: self.currentPos,
				change: self.distance,
				ease: self.ease
			};
            TTween.transition(self.slideList, attrs);
        }, self.speed);
    },
    run: function(){
		var self = this;
        self.bindMouse();
        self.autoRun();
    }
};

