

///////////////class eventDispathcer//////////
class EventDispatcher{
  constructor(){
      this.subscriberList = {};
      this.dispatchEvent=this.publish;
      this.addEventListener=this.subscrible;

  }
  subscrible(listener,eventname,handler){
      if (!this.subscriberList[eventname]) {
          this.subscriberList[eventname] = [];
        }
      this.subscriberList[eventname].push({listener:listener,handler: handler});
  }
  publish(event){
      if (!this.subscriberList[event.name]) { return false; } 
      var subscribers = this.subscriberList[event.name], count = subscribers ? subscribers.length : 0;
       while (count--) { 
           var subscriber = subscribers[count]; 
           subscriber.handler.call(subscriber.listener,event); 
       } 
  }

}
////////////
const CURRENT_SCENE_CHANGE="current_scene_change";
class EditorEvent{
  constructor(publisher,eventname,newScene,preScene){
    this.publisher=publisher;
    this.name=eventname;
    this.newScene=newScene;
    this.preScene=preScene;
  }
}
const USER_LOGIN_EVENT="user_login_event";
const FILE_SAVE_EVENT ="file-save-event";
const GET_FILELIST_EVENT="get_fieList_event"
const OPEN_FILE_EVENT="open_file_event"
class TaskEvent{
  constructor(publisher,eventname,response)//eventInfo={succeed:true|false[,detail:detailInfo]}
  {
   this.publisher=publisher;
   this.name=eventname;
   this.response=response;
  }
}
///////////////////////
class WS_Agent{
  send(message){this.ws.send(message)};
  onMessageHandler(msg){
    
    //from server,msg.data={task:"login"|"register"|...,resutlt:{succeed:true|false,msg:"login Ok"},[data]:{}}*/

    
    var response=JSON.parse(msg.data);
    
    switch(response.taskname){
      //for login task,reponse from server to client=
      //{task:"login",resutlt:{succeed:true|false,msg:"login Ok"},user:{name:username,pwd:password}} 
      case "login":
          var loginEvent=new TaskEvent(this,USER_LOGIN_EVENT,response);
          this.eventDispatcher.dispatchEvent(loginEvent);
          break;
      case "savefile":
           var saveFileEvent=new TaskEvent(this,FILE_SAVE_EVENT,response);
           this.eventDispatcher.dispatchEvent(saveFileEvent);
           break;
      case "getFileList":
           var getFileListEvent=new TaskEvent(this,GET_FILELIST_EVENT,response);
           this.eventDispatcher.dispatchEvent(getFileListEvent);
           break;
      case "openfile":
           var openFileEvent=new TaskEvent(this,OPEN_FILE_EVENT,response)
           this.eventDispatcher.dispatchEvent(openFileEvent);
           break;      
     default:
         throw(response.taskname+":"+"未定义的操作，服务器返回信息无法处理！")
    }
  }
  constructor(serverAdress){
      this.eventDispatcher=new EventDispatcher();
      this.ws=new WebSocket(serverAdress);
      var me=this;
      this.ws.onmessage = function(msg){me.onMessageHandler.call(me,msg)};
  }
  addEventListener(listener,eventname,handler){
    this.eventDispatcher.subscrible(listener,eventname,handler)
  }
  dispatchEvent(event){
    this.eventDispatcher.publish(event);  
  }
}
var WsAgent=new WS_Agent("ws://localhost:3001");
//class CommonUtilities---public utilites
   class CommonUtilities
   {   
       static getScrDpiPerInch() {
       var dpiPerInch = new Array();
       if (window.screen.deviceXDPI) {
           dpiPerInch['x'] = window.screen.deviceXDPI;
           dpiPerInch['y'] = window.screen.deviceYDPI;
       }
       else {
       var tmpNode = document.createElement("DIV");
       tmpNode.style.cssText = "width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden";
       document.body.appendChild(tmpNode);
       dpiPerInch['x'] = parseInt(tmpNode.offsetWidth);
       dpiPerInch['y'] = parseInt(tmpNode.offsetHeight);
       tmpNode.parentNode.removeChild(tmpNode); 
       }
       return dpiPerInch;
       }
       static getScrDpiPerMm(){
           var dpiPerInch=this.getScrDpiPerInch();
           var dpiPerMm=new Array();
           dpiPerMm['x']=dpiPerInch['x']/25.4;
           dpiPerMm['y']=dpiPerInch['y']/25.4;
           return dpiPerMm;
       }
       static getGuid()//
       {
        let t=(new Date).getTime();//dml
        while(t==(new Date).getTime());//dml
        var id=(new Date).getTime() ;
        return id;
       }
      static popFileDialog(callback)
      {
       var fileSelector=$("<input type=file />");
       fileSelector.attr("accept","image/gif,image/jpeg,image/png,image/bmp,image/svg");
       fileSelector.css("display","none");
       document.body.appendChild(fileSelector[0]);
      
       fileSelector[0].onchange=function(event){
           var file=event.target.files[0]
           callback("OK",file);
           document.body.removeChild(event.target);
       }
     
       fileSelector.trigger("click");
         
      }

      static readFileToString(fileObj,callback){
        
        var reader  = new FileReader();
        
        reader.addEventListener("load",function(){
            var result=this.result;
            callback("OK",result);
        }, false);
      
        if (fileObj) {
          reader.readAsText(fileObj);
        }
        
      }
      //---------------
      static thunkify(fn) {
        return function() {
          var args = new Array(arguments.length);
          var ctx = this;
      
          for (var i = 0; i < args.length; ++i) {
            args[i] = arguments[i];
          }
      
          return function (done) {
            var called;
      
            args.push(function () {
              if (called) return;
              called = true;
              done.apply(null, arguments);
            });
      
            try {
              fn.apply(ctx, args);
            } catch (err) {
              done(err);
            }
          }
        }
      };
     ////--------------
   static run(gen,args){
    var g = gen(args);
    function next(data){
    var result = g.next(data);
    if (result.done) return result.value;
    result.value(function(something,data){
      next(data);
    });
   }
   next();
  }
static *loadSymbolsFromFile(loaderType){
    var filename= yield CommonUtilities.thunkify( CommonUtilities.popFileDialog)();
    var fileContent=yield CommonUtilities.thunkify(CommonUtilities.readFileToString)(filename);
    var loader;
    loader=SymbolLoaderFactory.creatParser(loaderType);
    var dom=loader.loadSymbolsFromString(fileContent);  
    return JTopo.svgDom=dom;

}
static loadSymbolsFromString(loaderType,svgString){
  
  var loader=SymbolLoaderFactory.creatParser(loaderType);
  var dom=loader.loadSymbolsFromString(svgString);  
  return JTopo.svgDom=dom;

}


//-------
static getData(url,fnWin,fnFaild){
  //1.创建ajax对象
  var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
  //2.与服务器建立连接
  xhr.open("GET",url,true);
  //3.发送请求
  xhr.send();
  //4.接收服务器返回的信息
  xhr.onreadystatechange = function(){
      if(xhr.readyState == 4){
          if(xhr.status == 200){
              fnWin && fnWin(xhr.responseText);
          }else{
              fnFaild && fnFaild();
          }
      }
  }
}
}
   ///////竖排文字张旭鑫////////////

/**reference to :
* @author zhangxinxu(.com)
* @licence MIT
* @description http://www.zhangxinxu.com/wordpress/?p=7362
*updated by dingmingliang(jditor.com),2020-03-8
*/
CanvasRenderingContext2D.prototype.fillTextVertical = function (text, x0, y0) {
  var context = this;
  context.save();
  context.translate(x0,y0);//dml
  var x=0,y=0;
  
  var arrText = text.split('');
  var arrWidth = arrText.map(function (letter) {
      return context.measureText(letter).width;
  });
  
  var align = context.textAlign;
  var baseline = context.textBaseline;
  
  if (align == 'left') {
      x = x + Math.max.apply(null, arrWidth) / 2;
  } else if (align == 'right') {
      x = x - Math.max.apply(null, arrWidth) / 2;
  }
  if (baseline == 'bottom' || baseline == 'alphabetic' || baseline == 'ideographic') {
      y = y - arrWidth[0] / 2;
  } else if (baseline == 'top' || baseline == 'hanging') {
      y = y + arrWidth[0] / 2;
  }
  
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  
  // 开始逐字绘制
  arrText.forEach(function (letter, index) {
      // 确定下一个字符的纵坐标位置
      var letterWidth = arrWidth[index];
      // 是否需要旋转判断
      var code = letter.charCodeAt(0);
      if (code <= 256) {
          
          // 英文字符，旋转90°
          context.rotate(90 * Math.PI / 180);
          
      } else if (index > 0 && text.charCodeAt(index - 1) < 256) {
          // y修正
          y = y + arrWidth[index - 1] / 2;
      }
      if(code<256)context.strokeText(letter, y, 0);//英文已旋转
      // 旋转坐标系还原成初始态
      else context.strokeText(letter, 0, y);//中文未旋转
      if(code<256)context.rotate(-90 * Math.PI / 180);
      // 确定下一个字符的纵坐标位置
      if(index==0&&code==10&&index+1<arrText.length&&text.charCodeAt(index+1>=256))y=y+arrWidth[index+1];//开始为回车时，取下一字符宽度作为增量
      else y=y+arrWidth[index];
  });
  // 水平垂直对齐方式还原
  context.textAlign = align;
  context.textBaseline = baseline;
  context.restore();
};

export {EventDispatcher,CURRENT_SCENE_CHANGE,EditorEvent,CommonUtilities,WsAgent,FILE_SAVE_EVENT,USER_LOGIN_EVENT,
GET_FILELIST_EVENT, OPEN_FILE_EVENT}
  
  