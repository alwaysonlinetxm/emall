/** ------------------------------------------------------------------------------
* TTween
* @version 1.0
* @Explain �����;�̬�࣬�������컺��Ч��
* @author  ԭ���ߣ�˾ͽ�������ıࣺalwaysonlinetxm��
* @email   txm19921005@126.com
* �ⲿAPI:
* transition(el);         �����趨����
* (�Լ����л�����ʽ����)
* --------------------------------------------------------------------------------
*/

function TTween(){}
//�����趨����������el����Ҫ���û�����Ԫ�أ��ڶ��������ǻ������ö����趨����������
TTween.transition = function(el){
    el.style.position = "absolute";
    var options = arguments[1] || {},
    begin =  options.begin,                //��ʼλ��
    change = options.change,               //�仯��
    duration = options.duration || 500,    //����Ч������ʱ��
    field = options.field,                 //����ָ���������϶�top,left,width,height,opacity������Խ�������
    ftp = options.ftp || 50,               //ÿ���֡��
    onEnd = options.onEnd || function(){}, //��������ʱִ�еĺ���
    ease = options.ease,                   //Ҫʹ�õĻ�����ʽ
    end = begin + change,                  //����λ��
    startTime = new Date().getTime();      //��ʼִ�е�ʱ��
    (function(){
        setTimeout(function(){
			var px = "px";
            var newTime = new Date().getTime(),//��ǰ֡��ʼ��ʱ��
            timestamp = newTime - startTime,//��ȥʱ��
            delta = ease(timestamp / duration);
			if(field == "opacity"){
				px = "";
				el.style[field] = begin + delta * change;
			}else{
                el.style[field] = Math.ceil(begin + delta * change) + px;
			}
            if(duration <= timestamp){
                el.style[field] = end + px;
                onEnd();
            }else{
                setTimeout(arguments.callee,1000/ftp);//���µ��õ�ǰ�ĺ���
            }
        },1000/ftp)
    })()
}
//���ֻ�����ʽ
TTween.easeInQuad = function(pos){
    return Math.pow(pos, 2);
}

TTween.easeOutQuad = function(pos){
    return -(Math.pow((pos-1), 2) -1);
}

TTween.easeInOutQuad = function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,2);
    return -0.5 * ((pos-=2)*pos - 2);
}

TTween.easeInCubic = function(pos){
    return Math.pow(pos, 3);
}

TTween.easeOutCubic = function(pos){
    return (Math.pow((pos-1), 3) +1);
}

TTween.easeInOutCubic = function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,3);
    return 0.5 * (Math.pow((pos-2),3) + 2);
}

TTween.easeInQuart = function(pos){
    return Math.pow(pos, 4);
}

TTween.easeOutQuart = function(pos){
    return -(Math.pow((pos-1), 4) -1)
}

TTween.easeInOutQuart = function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
    return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
}

TTween.easeInQuint = function(pos){
    return Math.pow(pos, 5);
}

TTween.easeOutQuint = function(pos){
    return (Math.pow((pos-1), 5) +1);
}

TTween.easeInOutQuint = function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,5);
    return 0.5 * (Math.pow((pos-2),5) + 2);
}

TTween.easeInSine = function(pos){
    return -Math.cos(pos * (Math.PI/2)) + 1;
}

TTween.easeOutSine = function(pos){
    return Math.sin(pos * (Math.PI/2));
}

TTween.easeInOutSine = function(pos){
    return (-.5 * (Math.cos(Math.PI*pos) -1));
}

TTween.easeInExpo = function(pos){
    return (pos==0) ? 0 : Math.pow(2, 10 * (pos - 1));
}

TTween.easeOutExpo = function(pos){
    return (pos==1) ? 1 : -Math.pow(2, -10 * pos) + 1;
}

TTween.easeInOutExpo = function(pos){
    if(pos==0) return 0;
    if(pos==1) return 1;
    if((pos/=0.5) < 1) return 0.5 * Math.pow(2,10 * (pos-1));
    return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
}

TTween.easeInCirc = function(pos){
    return -(Math.sqrt(1 - (pos*pos)) - 1);
}

TTween.easeOutCirc = function(pos){
    return Math.sqrt(1 - Math.pow((pos-1), 2))
}

TTween.easeInOutCirc = function(pos){
    if((pos/=0.5) < 1) return -0.5 * (Math.sqrt(1 - pos*pos) - 1);
    return 0.5 * (Math.sqrt(1 - (pos-=2)*pos) + 1);
}

TTween.easeOutBounce = function(pos){
    if ((pos) < (1/2.75)){
        return (7.5625*pos*pos);
    } else if (pos < (2/2.75)){
        return (7.5625*(pos-=(1.5/2.75))*pos + .75);
    } else if (pos < (2.5/2.75)){
        return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
    } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
    }
}

TTween.easeInBack = function(pos){
    var s = 1.70158;
    return (pos)*pos*((s+1)*pos - s);
}

TTween.easeOutBack = function(pos){
    var s = 1.70158;
    return (pos=pos-1)*pos*((s+1)*pos + s) + 1;
}

TTween.easeInOutBack = function(pos){
    var s = 1.70158;
    if((pos/=0.5) < 1) return 0.5*(pos*pos*(((s*=(1.525))+1)*pos -s));
    return 0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos +s) +2);
}

TTween.elastic = function(pos){
    return -1 * Math.pow(4,-8*pos) * Math.sin((pos*6-1)*(2*Math.PI)/2) + 1;
}

TTween.swingFromTo = function(pos){
    var s = 1.70158;
    return ((pos/=0.5) < 1) ? 0.5*(pos*pos*(((s*=(1.525))+1)*pos - s)) :
    0.5*((pos-=2)*pos*(((s*=(1.525))+1)*pos + s) + 2);
}

TTween.swingFrom = function(pos){
    var s = 1.70158;
    return pos*pos*((s+1)*pos - s);
}

TTween.swingTo = function(pos){
    var s = 1.70158;
    return (pos-=1)*pos*((s+1)*pos + s) + 1;
}

TTween.bounce = function(pos){
    if (pos < (1/2.75)){
        return (7.5625*pos*pos);
    } else if (pos < (2/2.75)){
        return (7.5625*(pos-=(1.5/2.75))*pos + .75);
    } else if (pos < (2.5/2.75)){
        return (7.5625*(pos-=(2.25/2.75))*pos + .9375);
    } else {
        return (7.5625*(pos-=(2.625/2.75))*pos + .984375);
    }
}

TTween.bouncePast = function(pos) {
    if (pos < (1/2.75)){
        return (7.5625*pos*pos);
    } else if (pos < (2/2.75)) {
        return 2 - (7.5625*(pos-=(1.5/2.75))*pos + .75);
    } else if (pos < (2.5/2.75)){
        return 2 - (7.5625*(pos-=(2.25/2.75))*pos + .9375);
    } else {
        return 2 - (7.5625*(pos-=(2.625/2.75))*pos + .984375);
    }
}

TTween.easeFromTo = function(pos){
    if ((pos/=0.5) < 1) return 0.5*Math.pow(pos,4);
    return -0.5 * ((pos-=2)*Math.pow(pos,3) - 2);
}

TTween.easeFrom = function(pos){
    return Math.pow(pos,4);
}

TTween.easeTo = function(pos){
    return Math.pow(pos,0.25);
}

TTween.linear = function(pos){
    return pos
}

TTween.sinusoidal = function(pos){
    return (-Math.cos(pos*Math.PI)/2) + 0.5;
}

TTween.reverse = function(pos){
    return 1 - pos;
}

TTween.mirror = function(pos, transition){
    transition = transition || TTween.sinusoidal;
    if(pos<0.5)
        return transition(pos*2);
    else
        return transition(1-(pos-0.5)*2);
}

TTween.flicker = function(pos){
    var pos = pos + (Math.random()-0.5)/5;
    return TTween.sinusoidal(pos < 0 ? 0 : pos > 1 ? 1 : pos);
}

TTween.wobble = function(pos){
    return (-Math.cos(pos*Math.PI*(9*pos))/2) + 0.5;
}

TTween.pulse = function(pos, pulses){
    return (-Math.cos((pos*((pulses||5)-.5)*2)*Math.PI)/2) + .5;
}

TTween.blink = function(pos, blinks){
    return Math.round(pos*(blinks||5)) % 2;
}

TTween.spring = function(pos){
    return 1 - (Math.cos(pos * 4.5 * Math.PI) * Math.exp(-pos * 6));
}

TTween.none = function(pos){
    return 0
}

TTween.full = function(pos){
    return 1
} 