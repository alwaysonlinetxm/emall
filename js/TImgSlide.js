/**
* TImgSlide
* @version 1.0
* @Explain ͼƬ�õƣ��������л�ͼƬ��֧��ˮƽ����ֱ���ַ�ʽ
* @author  ԭ����:artwl���ıࣺalwaysonlinetxm
* @email   txm19921005@126.com
* link: http://artwl.cnblogs.com
* PS: ��Ҫ����TImgSlide.css�ļ����ļ��е�id��������html�е���ӦԪ�ض�Ӧ
* �ⲿAPI:
* TImgSlide(ele, direction, picwidth, picheight, speed, ease);    ���캯��
* run();                                                          ��������
*/

//�����Ǵ���ʾ������Ԫ�أ�ͼƬ�л�����ͼƬ��Ⱥ͸߶ȣ��л�ʱ������ʹ�õĻ�����ʽ
function TImgSlide(ele, direction, picwidth, picheight, speed, ease){
	var self = this;
    self.slideList = ele.getElementsByTagName("ul")[0];                     //����ʾ��ͼƬ�б�
    self.slideNums = ele.getElementsByTagName("ul")[1].children;          //Բ�α�ʾ����children������childNodesΪ��ֻȡ<li>Ԫ��
    self.direction = direction || "left";              						//��������
    self.picwidth = picwidth || parseFloat(TFunc.getStyle(ele).width);      //ͼƬ���
	self.picheight = picheight || parseFloat(TFunc.getStyle(ele).height);   //ͼƬ�߶�
	self.size = self.direction === "left" ? self.picwidth : self.picheight; //����ʱ�ĵ�λ����    
	self.speed = speed || 5000;                        						//�Զ�������ʱ����
	self.ease = ease || TTween.easeOutCirc;           		 				//Ҫʹ�õĻ�����ʽ
    self.currentIndex = 0;                             						//��ǰ����ʾ��ͼƬ�ı��
    self.distance = self.size;                         						//�仯�ľ���
    self.currentPos = 0;                               						//��ǰ����ʼλ��
    self.runHandle = null;                             						//�Զ������Ķ�ʱ��
    self.length = self.slideNums.length;               						//ͼƬ����
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
			})(i));//Ϊ�˽�ÿ��i�Ĳ�ֵͬ����
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

