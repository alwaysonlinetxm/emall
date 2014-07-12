/** ------------------------------------------------------------------------------
* TPlayer
* @version 1.0
* @Explain 音乐播放器
* @author  alwaysonlinetxm
* @email   txm19921005@126.com
* PS: 进度条与音量元素需设为relative，拖动快及内部inset需设为absolute
* 外部API:
* TPlayer(config);                            构造函数
* addSong(name, path, info);                  添加曲目
* setCurrentSong(num, play);                  设置播放曲目
* setCurrentInfo(num, flow, width, rate);     设置当前曲目信息
* --------------------------------------------------------------------------------
*/

//参数为配置参数对象
function TPlayer(config){  
    var self = this;
	self.media = config.media;                     		//媒体元素 
	self.source = config.source;                   		//播放路径元素数组
	self.songList = new Array();                   		//曲目列表
    self.previousButton = config.previous;         		//前一首按钮元素    
    self.nextButton = config.next;                 		//后一首按钮元素 
	if (config.play){
		self.playButton = config.play.play;        		//播放按钮元素
		self.playClass = config.play.playClass;    		//正在播放类名
		self.pauseClass = config.play.pauseClass;  		//暂停播放类名 
	};
	self.stopButton = config.stop;                 		//停止播放按钮元素 
	self.currentInfo = config.currentInfo;         		//当前曲目信息元素 	
	self.infoTimer = null;                         		//信息流动计时器
	self.currentNum = null;                        		//当前播放曲目编号
	if (config.bar){
		self.bar = config.bar.bar;   			   		//进度条元素
		self.barLength = config.bar.length;        		//进度条长度(应减去拖动快长度)
		self.barInset = config.bar.barInset;       		//进度条内部长度元素
		self.barEnd = config.bar.barEnd;           		//进度条拖动块元素
		self.barEndDrag = false;                   		//进度条拖动快拖动标志
	};
	if (config.volume){
		self.volume = config.volume.volume;            	//音量元素
		self.volumeLength = config.volume.length;      	//音量条长度(应减去拖动快长度)
		self.volumeInset = config.volume.volumeInset;  	//音量内部长度元素
		self.volumeEnd = config.volume.volumeEnd;      	//音量拖动快元素
		self.volumeEndDrag = false;                   	//进度条拖动快拖动标志
		self.volumeIcon = config.volume.volumeIcon;    	//音量图标元素
		self.volumeClass = config.volume.volumeClass;   //音量类名
		self.muteClass = config.volume.muteClass;  		//静音类名
	};
	if (config.time){
		self.currentTime = config.time.current;    	   	//当前时间元素
		self.duration = config.time.duration;          	//总时间元素
		self.barTimer = null;                          	//曲目进度计时器
	}
	//初始化
	self.init();
}

TPlayer.prototype = {
	init: function(){ //初始化函数
		var self = this;
		//注册鼠标事件
		TFunc.on(self.playButton, 'mouseup', function(){ self.playSong(); });
		TFunc.on(self.stopButton, 'mouseup', function(){ self.stop(); });
		TFunc.on(self.previousButton, 'mouseup', function(){ self.previous(); });
		TFunc.on(self.nextButton, 'mouseup', function(){ self.next(); });
		TFunc.on(self.bar, 'mousedown', function(e){ self.barTo(e); });	
		TFunc.on(self.barEnd, 'mousedown', function(){ self.barEndDrag = true; });
		TFunc.on(document, 'mouseup', function(){ self.barEndDrag = self.volumeEndDrag = false; });
		TFunc.on(self.bar, 'mousemove', function(e){ if(self.barEndDrag){ self.barTo(e); };});
		TFunc.on(self.volumeIcon, 'mouseup', function(){ self.mute(); });
		TFunc.on(self.volume, 'mousedown', function(e){ self.volumeTo(e); });
		TFunc.on(self.volumeEnd, 'mousedown', function(){ self.volumeEndDrag = true; });
		TFunc.on(self.volume, 'mousemove', function(e){ if(self.volumeEndDrag){ self.volumeTo(e); };});
		//将预览拖动快元素设置为禁止选中
		self.barEnd.onselectstart = function(){ return false; };
		self.bar.onselectstart = function(){ return false; };
		self.volumeEnd.onselectstart = function(){ return false; };
		self.volume.onselectstart = function(){ return false; };
		//设置初始音量
		self.volumeTo({target:null, offsetX:self.volumeLength/2});
	},
	addSong: function(name, path, info){ //添加曲目，参数是曲目名，曲目路径数组，曲目信息
		var self = this;
		if (info == undefined) info = name; //当为传入信息时，以曲目名作为信息
		self.songList.push({name: name, path: path, info: info});//info用处待定
	},
	setCurrentSong: function(num, play){ //设置播放曲目，参数是曲目编号，以及是否立即播放指示
		var self = this;
		//更新当前播放曲目编号
		self.currentNum = num; 
		for (var i = 0; i<self.source.length && i<self.songList[num].path.length; i++){
			self.source[i].src = self.songList[num].path[i];
		}
		//载入新曲目
		self.media.load();
		//立即播放
		if (play == true){ self.play(); };
	},
	setCurrentInfo: function(num, flow, width, rate){ //设置当前曲目信息，参数是曲目编号，是否流动，流动速率，流动框长度
		var self = this;
		self.currentInfo.innerHTML = self.songList[num].name; //以曲目名作为当前曲目信息
		self.currentInfo.style.left = "0px";
		//清除之前的计时器，并设置新计时器
		if (self.infoTimer) { clearInterval(self.infoTimer); };
		//不流动
		if (flow == false){ return; };
		self.infoTimer = setInterval(function(){
			var left = self.currentInfo.style.left.slice(0, -2)*1;
			//整条信息已不在显示范围内
			if (-left >= TFunc.getStyle(self.currentInfo).width.slice(0, -2)){
				self.currentInfo.style.left = (width || 0) + "px";
			} else {
				self.currentInfo.style.left = (left-1) + "px";
			}
		}, rate || 100);
	},
	playSong: function(){ //播放按钮触发事件
		var self = this;
		//当前没有就绪曲目则返回
		if (self.currentNum == null) { return; };
		if (self.media.paused){ //当前曲目暂停
			self.play();
		} else {
			self.pause();
		}
	},
	previous: function(){ //前一首曲目
		var self = this;
		//当前没有就绪曲目则返回
		if (self.currentNum == null) { return; };
		if (self.currentNum-1 >= 0){ //当前曲目编号减一
			self.currentNum--;
		} else { //循环到最后一首
			self.currentNum = self.songList.length - 1;
		}
		self.setCurrentInfo(self.currentNum, true, 130);
		self.setCurrentSong(self.currentNum, true);
	},
	next: function(){ //后一首曲目
		var self = this;
		//当前没有就绪曲目则返回
		if (self.currentNum == null) { return; };
		if (self.currentNum+1 < self.songList.length){ //当前曲目编号加一
			self.currentNum++;
		} else { //循环到第一首
			self.currentNum = 0;
		}
		self.setCurrentInfo(self.currentNum, true, 130);
		self.setCurrentSong(self.currentNum, true);
	},
	barTo: function(e){ //进度条跳转
		var self = this;
		//当前没有就绪曲目则返回
		if (self.currentNum == null){ return; };
		//当点击到拖动快则返回
		if (e.target == self.barEnd){ return; };
		//鼠标点击时位于bar中的x坐标
	    var x = e.offsetX || e.layerX;
		x = x > self.barLength ? self.barLength : x;
		self.barInset.style.width = x + "px";
		//限制拖动快最大left
		self.barEnd.style.left = x + "px";
		//设置曲目进度
		self.media.currentTime = x/self.barLength*self.media.duration;
	},
	mute: function(){ //静音
		var self = this;
		if (self.media.muted){
			//切换音量图标
			TFunc.removeClass(self.volumeIcon, self.muteClass);
			TFunc.addClass(self.volumeIcon, self.volumeClass);
			self.media.muted = false;
		} else {
			TFunc.removeClass(self.volumeIcon, self.volumeClass);
			TFunc.addClass(self.volumeIcon, self.muteClass);
			self.media.muted = true;
		}
	},
	volumeTo: function(e){
		var self = this;
		//当点击到拖动快则返回
		if (e.target == self.volumeEnd){ return; };
		//鼠标点击时位于volume中的x坐标
	    var x = e.offsetX || e.layerX;
		x = x > self.volumeLength ? self.volumeLength : x;
		self.volumeInset.style.width = x + "px";
		//限制拖动快最大left
		self.volumeEnd.style.left = x + "px";
		//设置音量
		self.media.volume = x/self.volumeLength;
	},
	play: function(){ //播放
		var self = this;
		//切换按钮图标
		TFunc.removeClass(self.playButton, self.pauseClass);
		TFunc.addClass(self.playButton, self.playClass);
		self.media.play();
		//设置待播放曲目初始信息
		if (self.barTimer == null){
			//设置总时间
			var dtimer = setInterval(function(){
				if (self.media.readyState == 4){ //曲目已就绪
					self.duration.innerHTML = self.formatTime(self.media.duration);
					clearInterval(dtimer);
				}
			}, 100);
			//设置当前时间
			self.currentTime.innerHTML = "00:00";
			if (self.barTimer != null){ clearInterval(self.barTimer); };
			self.barTimer = setInterval(function(){
				//设置进度条
				var w = Math.floor(self.media.currentTime/self.media.duration*self.barLength);
				self.barInset.style.width = w + "px";
				self.barEnd.style.left = w + "px";
				//播放完毕
				if (Math.floor(self.media.currentTime) >= Math.floor(self.media.duration)){
					self.stop();
					clearInterval(self.barTimer);
					self.barTimer = null;
				}
				self.currentTime.innerHTML = self.formatTime(self.media.currentTime);
			}, 100);
		}
	},
	pause: function(){ //暂停
		var self = this;
		//切换按钮图标
		TFunc.removeClass(self.playButton, self.playClass);
		TFunc.addClass(self.playButton, self.pauseClass);
		self.media.pause();
	},
	stop: function(){ //停止
		var self = this;
		//切换按钮图标
		TFunc.removeClass(self.playButton, self.playClass);
		TFunc.addClass(self.playButton, self.pauseClass);
		//进度归零
		self.barInset.style.width = "0px";
		self.barEnd.style.left = "0px";	
		//时间归零
		self.currentTime.innerHTML = "00:00";
		self.media.load();
	},
	formatTime: function(time){ //将时间转为标准格式
		var minute = Math.floor(time/60);
		var second = Math.floor(time%60);
		if (minute < 10) { minute = "0" + minute; };
		if (second < 10) { second = "0" + second; };
		return minute + ":" + second;
	}
};
