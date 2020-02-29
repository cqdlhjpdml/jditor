 ///////////////////////////////////

////////////////////////////////
class Tool{
    static getInstance(toolItem,toolManager){//单例模式
        if(this.instance) return this.instance;
        this.instance=new toolItem.toolClass(toolItem,toolManager);
        return this.instance;
    }
    setSceneMouseHandlerObject(scene){
          scene.mouseHandlerObject=this;
    } 
   
    activate(active,event){
       var scene=this.toolManager.getScene();
       if(!active) {
            this.clearTask();
            this.toolBtn.style.border="none";
            scene.removeEventListener("click");
           
        }
        else{
          
          this.setSceneMouseHandlerObject(scene);
          this.setSceneMouseHandler(scene);
          this.toolBtn.style.opacity="0.5";
          this.toolBtn.style.border="1px solid red";
          this.toolBtn.style.background="#8080ff";
          this.toolManager.setCursor("crosshair" );//：十字标  
          this.toolManager.setCurrentTool(this);
        }
    }
   getToolBtn(){return this.toolBtn}
    /**************************/
    constructor(toolItem,toolManager){
       this.toolItem=toolItem;
       this.toolManager=toolManager;
      
       this.toolBtn=new Image();
       this.toolBtn.src="icons/"+toolItem.icon;
       this.toolBtn.alt=toolItem.caption;
       this.toolBtn.tooltips=toolItem.tooltips;
    
       this.toolBtn.className="toolBtn";
       var me=this;
       this.toolBtn.onclick=function(event){
         var ctool=toolManager.getCurrentTool();    
         if(ctool)ctool.activate(false,event);
         me.activate(true,event)
       }
      this.toolBtn.onmouseenter=function(event){
       var ctool=toolManager.getCurrentTool();
       if(ctool===me)return ;
       me.toolBtn.style.cssText="opacity:0.5"; 
  
      }
      this.toolBtn.onmouseleave=function(event){
        var ctool=toolManager.getCurrentTool();
        if(ctool===me)return ;
        me.toolBtn.style.cssText="opacity:1.0";   
      } 
   
   }
  
  
    setProperty(name,value){
      this[name]=value;
    }
    getProperty(name){
        return this[name];
    }
    setSceneMouseHandler(scene){
  
    }
    clearTask(){
      
    }
  }
  const TASK_END=1;
  //////////////////////////////
  class ToolsPanel extends Tool{
    //override, mutiple instance popup-style tools panel maybe required
    static getInstance(toolItem,toolManager){//单例模式
        
        this.instance=new toolItem.toolClass(toolItem,toolManager);
        return this.instance;
    }  
    activate(active,event){
       
          if(!active) {
               this.clearTask();
               $(this.btnDiv).hide();
               this.toolBtn.style.opacity="1.0";
               
           }
           else{
             var target=event.target;
             var x=target.offsetLeft,y=target.offsetTop;
             var h=target.height;
             if(!this.btnDiv){
                 let toolGroup=this.createSymbolToolGroup(this.toolItem)
                 this.btnDiv=this.createToolPanel(toolGroup);
             }
             $(this.btnDiv).css({
              left: x,
              top: y+h+10
             });
             $(this.btnDiv).show();
             this.toolManager.setCurrentTool(this);
           }
       }
       createSymbolToolGroup(toolItem)
       {
           var industry=toolItem.industry;
           var selector=`[industry='${industry}']`;
           var svgElements=JTopo.svgDom.querySelectorAll(selector);
           var toolgroups={};
           
           for(let i=0;i<svgElements.length;i++){
                  let groupname=svgElements[i].getAttribute("group");
                  if(!toolgroups[groupname]) toolgroups[groupname]=[];
                  let devicename=svgElements[i].getAttribute("device");
                  let caption=svgElements[i].getAttribute("caption");
                  selector=`[industry=${industry}][group=${groupname}][device=${devicename}]`;
                  var toolItem={};
                  toolItem.cation=caption;
                  toolItem.symbolType=selector;
                  toolItem.icon=devicename+".png";
                  toolItem.tooltips=caption;
                  toolItem.toolClass=SvgNodeTool;
                  
                  let tool=new SvgNodeTool(toolItem,this.toolManager);
                  toolgroups[groupname].push(tool);
        
           }
  
           return toolgroups;
       } 
       createToolPanel(toolGroups){
         
          var body = document.body; 
          var div = document.createElement("div");
          div.className="group-div";
          body.appendChild(div);
          for(var toolgroupname in toolGroups)
          {
              var ul=document.createElement("ul");
              ul.className="group-ul";
              div.appendChild(ul);
              var li=document.createElement("li"); 
              ul.appendChild(li);
              li.innerHTML=`<span>${toolgroupname}</span>`;
              li.className='menu-title'
              li=document.createElement("li");
              li.className="menu-bar"; 
              ul.appendChild(li);
              toolGroups[toolgroupname].forEach(function(tool){
                 li.appendChild(tool.toolBtn); 
              });
          }
          return div;
          
       }
      
      
  }
  /////////////////////////////
  class TextBoxTool extends Tool{
     
      mouseclickHandler(event) {
          
          var x=event.x;
          var y=event.y;
          var scene=event.scene;
          var me=scene.mouseHandlerObject;
          var textNode = new JTopo.TextNode('新文本框');
          textNode.font = 'bold 16px 微软雅黑';
          textNode.fontColor="#303030"
          textNode.setLocation(x, y);
          scene.add(textNode);
          var args={};
          args.obj=textNode;
          args.scene=scene;
          me.toolManager.actionManager.pushUndoAction(new JTopo.AddAction(args));
          scene.removeEventListener("click");
          me.toolManager.refresh(TASK_END);  
          scene.removeEventListener("click");
          scene.removeEventListener("click");
          scene.mouseHandlerObject.toolManager.refresh(TASK_END);
           
      }  
       setSceneMouseHandler(scene){
          
          scene.addEventListener("click",this.mouseclickHandler);  
        
      }
  }
  /////////////////////////////////
   class ImageTool extends Tool{
      
      mouseclickHandler(event) {
          
          var x=event.offsetX;
          var y=event.offsetY;
          var scene=event.scene;
          var me=scene.mouseHandlerObject;
          CommonUtilities.popFileDialog(insertImageCallback)  ; 
          function insertImageCallback(flag,imageFile){
          if(flag=="OK"){
           var imageNode = new JTopo.Node();
           var filename=imageFile.name;
           imageNode.setImage(".\\img\\" + filename,true);
           imageNode.setLocation(x, y);
           scene.add(imageNode);
           var args={};
           args.obj=imageNode;
           args.scene=scene;
           me.toolManager.actionManager.pushUndoAction(new JTopo.AddAction(args));
           scene.removeEventListener("click");
           me.toolManager.refresh(TASK_END);  
           scene.removeEventListener("click");
           scene.removeEventListener("click");
           scene.mouseHandlerObject.toolManager.refresh(TASK_END);
          }

          
          }    
        
      }  
       setSceneMouseHandler(scene){
          scene.addEventListener("click",this.mouseclickHandler);  
        
      }
   }
  ////////////////////////////////
  class SvgNodeTool extends Tool{
  
      mouseclickHandler(event) {
          var x=event.x;
          var y=event.y;
          var scene=event.scene;
          var me=scene.mouseHandlerObject;
          var node=new JTopo.SvgNode(me.toolItem.symbolType,me.toolItem.text);
          node.setLocation(x,y);
          scene.add(node);
          var args={};
          args.obj=node;
          args.scene=scene;
          me.toolManager.actionManager.pushUndoAction(new JTopo.AddAction(args));
          scene.removeEventListener("click");
          me.toolManager.refresh(TASK_END);  
      }  
       setSceneMouseHandler(scene){
          scene.addEventListener("click",this.mouseclickHandler); 
        
      }   
  }
  ///////////////////////////////
  class LinkTool extends Tool{
   
    clearTask(){
        var scene=this.toolManager.getScene();
        var me=scene.mouseHandlerObject;
        let k=me.midLinks.length;
        if(k==0) return;
        if(me.midLinks[k-1].nodeZ instanceof Connector)  return;
        
        for(let i=0;i<k;i++){
            let link=me.midLinks[i];
            scene.remove(link);
            scene.remove(link.nodeA);
            if(i==k-1) scene.remove(link.nodeZ)
        }   

        
    }  
     setSceneMouseHandler(scene){
        var from=null,last=null,path=[],midLinks=[];
        var undoKeeps=[];//undoKeeps:when undo action,the connector inserted before the link shuoud be keeped.
        scene.mouseHandlerObject.midLinks=midLinks;  
          function mouseclickHandler(event){
              var x=event.x;
              var y=event.y;
              //console.log(x,y);
              var scene=event.scene;
              var me=scene.mouseHandlerObject;
              
              if(!from&&scene.mouseOverelement){
                 if(scene.mouseOverelement.elementType!="Connector") {//click a node its elementType is not "Connector"
                  let owner=scene.mouseOverelement;
                  let connector=new Connector(owner);
                  connector.setCenterLocation(x,y); 
                  scene.add(connector);
                  from=connector;
                  last=connector;
                  path.push({x:connector.cx,y:connector.cy});
                  
                  }
                 else{//a start connector clicked
                 from=scene.mouseOverelement;
                 last=scene.mouseOverelement;
                 path.push({x:scene.mouseOverelement.cx,y:scene.mouseOverelement.cy});
                 undoKeeps.push(from);//here from is a existed connector
                 }
                 scene.addEventListener("mousemove",mousemoveHandler);
                 return;
  
              }
  
              if(from&&!scene.mouseOverelement){
                  
                   let midnode=new JTopo.Node();
                   midnode.height=5;
                   midnode.width=5;
                   midnode.fillColor="125,125,125";
                   midnode.cx=t.cx,midnode.cy=t.cy;
                   let link=new FreeLink(last,midnode);
                   link.strokeColor="128,128,128"
                   midnode.visible=true;
                   link.showAZ=true;
                   scene.add(midnode);
                   scene.add(link);
                   last=midnode;
                   path.push({x:midnode.cx,y:midnode.cy});
                   midLinks.push(link);
                   scene.remove(tk);
                   tk=new JTopo.Link(last,t);
                   scene.add(tk);
                   return; 
                  
                 

               }
               if(from&&scene.mouseOverelement){//this is a end connector
                  var endConnector;
                  if(scene.mouseOverelement===tk) return;
                  if(scene.mouseOverelement.elementType!="Connector"){ 
                      let owner=scene.mouseOverelement;
                      let connector=new Connector(owner);
                      if(scene.keyStatus.shift)
                      connector.setCenterLocation(t.cx,t.cy); 
                      else connector.setCenterLocation(x,y); 
                      scene.add(connector);
                      endConnector=connector;
                  
                  }
                  else{
                  endConnector=scene.mouseOverelement;
                  undoKeeps.push(endConnector);//here endConnector is a existed connector
                  }
                  let link=new FreeLink(last,endConnector);
                  link.showAZ=true;
                  link.strokeColor="128,128,128"
                  scene.add(link);
                  path.push({x:endConnector.cx,y:endConnector.cy});
                  midLinks.push(link);
                  from=null;last=null;
                  scene.keyStatus.shift=0;
                  me.toolManager.refresh(TASK_END); 
                  scene.removeEventListener("mousemove");
                  scene.removeEventListener("click");
                  scene.remove(t);
                  scene.remove(tk);
                  var args={};
                  args.scene=scene;
                  args.links=midLinks;
                  args.undoKeeps=undoKeeps;
                  me.toolManager.actionManager.pushUndoAction(new JTopo.LinkAction(args)); 
  
              }                                                                                                         
              
              if(!from&&!scene.mouseOverelement){
                me.toolManager.refresh(1);
                scene.removeEventListener("click");
                return;
  
              }
                                                          
          }
          var t,tk;
          function mousemoveHandler(event){
              var x=event.x;
              var y=event.y;
              var scene=event.scene;
              var me=scene.mouseHandlerObject;                          
              if(!t){
                  t=new JTopo.Node();
                  t.height=5;
                  t.width=5;
                  t.fillColor="100,100,100";
                  t.alpha=1;
                  t.setCenterLocation(x,y);
                  t.visible=false;
                  tk=new JTopo.Link(last,t);
                  scene.add(t);
                  scene.add(tk);
                  return;
              }
              if(!scene.keyStatus.shift)t.setCenterLocation(x,y);
              else{ 
                var dx=Math.abs(x-last.cx),dy=Math.abs(y-last.cy);
                if(dx-dy>0)//水平横向移动  
                 t.setCenterLocation(x,last.cy)
                else //垂直纵向移动
                   t.setCenterLocation(last.cx,y)
              }
         
                                               
          }
          
          scene.addEventListener("click",mouseclickHandler);
       }  
  }
  //////////////////////////////
  class ConnectorTool extends Tool {
       setSceneMouseHandler(scene){
          function mouseclickHandler(event){
              var x=event.x;
              var y=event.y;
              var me=scene.mouseHandlerObject
              var owner=event.scene.mouseOverelement;
              if(!owner) {me.toolManager.refresh(TASK_END);return ;}
              var connector=new Connector(owner);
              connector.setLocation(x,y); 
              scene.add(connector);
              scene.removeEventListener("click");  
              me.toolManager.refresh(TASK_END);
          }
          
          scene.addEventListener("click",mouseclickHandler);
       }  
  }
  ////////////Command:点击立即执行的工具或菜单//////////////
class Command extends Tool{
    
    constructor(toolItem,toolManager){
        super(toolItem,toolManager);
        var me=this;
        this.toolBtn.onclick=function(event){me.execute.apply(me,arguments)};
        
        var li=document.createElement("li");//与css配合
        var a=document.createElement("a");
        a.innerHTML=toolItem.caption;
        a.onclick=function(event){me.execute.apply(me,arguments);$(li.parentElement).hide()};
        li.appendChild(a);
        this.menu=li;
    }
    
    execute(event){
     
    }

}
/*MyDialog:wrapper of jquery-ui dialog
 对话框有titlbar,contentbar,buttonbar由上至下三部分组成，
 上下有jq_ui生成，,中间contentbar基类默认生成“you's welcome”Div,
 由子类重载生成具体内容
 */

class MyDialog{
    
    constructor(title){
        this.eventDispatcher=new EventDispatcher();
        this.id=CommonUtilities.getGuid();
        this.title=title;
        
    }
    
    show(){$( `#${this.id}` ).dialog("open")};
    hide(){$( `#${this.id}` ).dialog("hide")}
    //overridable 
    contentBar(){
        this.jqContentBar=$(`<div>welcome to MyDialog</div>`);
        return this.jqContentBar;
    }
    //overridable
    getContentIno(){/*
        返回信息，供buttonbar按钮的回调函数使用*/
        return null;
    }
    buttonBar(){
       
    }
    //overiddable
    createDialogContainer(){
        this.jqDiaContainer=$(`<div id=${this.id} title=${this.title}></div>`);
        this.jqDiaContainer.visible=false;
        $(document.body).append(this.jqDiaContainer)
        this.jqDiaContainer.append(this.contentBar());
        this.jqDiaContainer.append(this.buttonBar());  
    }
    //overddable,generate jq ui diaolog and register the event callbacks
    jqDialog(){
        $( `#${this.id}` ).dialog({
            autoOpen: false,
            show: {
              effect: "blind",
              duration: 1000
            },
            hide: {
              effect: "explode",
              duration: 1000
            }
          }); 
                 
    }
    //create:overridable if you need
    create(){
      this.createDialogContainer();
      this.jqDialog();    
    }
    addEventListener(listener,eventname,handler){
        this.eventDispatcher.subscrible(listener,eventname,handler)
    }
    dispatchEvent(event){
        this.eventDispatcher.publish(event);  
    }
    
}

//////////////////////////////////////////////////////////
class LoginDialog extends MyDialog{
    restetUI(){
        let pwdInput=document.getElementById(`${this.pwdInputID}`);
        let hintSpan=document.getElementById(`${this.jqHintSpanID}`);
        $(hintSpan).css({"background-color":"#d0d0d0"});
        pwdInput.value="";
        $(hintSpan).html("请输入用户名和密码");
    }
    wsNotiyHandler(wsLoginEvent){
      //for login task,reponse from server to client=
      //{task:"login",resutlt:{succeed:true|false,msg:"login Ok"},user:{name:username,pwd:password}} 
        
        var response=wsLoginEvent.response;
        var hintSpan=document.getElementById(`${this.jqHintSpanID}`);
        
    
        if(response.result.succeed==true){
            $(hintSpan).css({"background-color":"#e0d0d0"});
            $(hintSpan).html(response.result.msg+"，对话框将自动关闭");
            this.dispatchEvent(wsLoginEvent);
                       
            setTimeout(()=>{
                          $(`#${this.id}` ).dialog("close")
                             
                           },2000);
        }
        else{
            $(hintSpan).css({"background-color":"#eed0d0"});
            $(hintSpan).html(response.result.msg);
        }
    }
    //overridae
    jqDialog(){
        var me=this;
        
        WsAgent.addEventListener(this,USER_LOGIN_EVENT,this.wsNotiyHandler);
        $(`#${this.id}` ).dialog({
            close:false,
            autoOpen:false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
               "login":{
                    text: "登录",
                    
                    click: function() {
                        var username=document.getElementById(me.useInputID).value;
                        var pwd=document.getElementById(me.pwdInputID).value;
                        //if(username.length<3){return;}//check the valid of username
                        //if(pwd.length<6){return;}//check valid of password
                        //request={task:[login|register|save|open],user:{name:username,pwd:password}}
                        var request={task:"login",user:{name:`${username}`,pwd:`${pwd}`,}};
                        var jsonRequest=JSON.stringify(request);
                        WsAgent.send(jsonRequest);
                    }
                },
               
              "Cancel":{ 
                text:"退出",
                click:function(  ){ 
                  $(`#${this.id}` ).dialog("close");
                  
                },
              }
          }});
          
          $(`#${this.id}`).on( "dialogclose", function(){me.restetUI.call(me)} );
       

    }
    contentBar(){
        var  id=CommonUtilities.getGuid();
        this.jqContentBar=$(`<div id=${id}></div>`);
        this.jqContentBar.css({"display": "flex",
                           'flex-direction':'column',
                           'justify-content':'center',
                           'align-items':'center'
                        });
        this.useInputID=CommonUtilities.getGuid();
        this.pwdInputID=CommonUtilities.getGuid();
        this.usernameRuleID=CommonUtilities.getGuid();
        this.passwordRuleID=CommonUtilities.getGuid();
        this.jqUserInoBar=$(`<div" >\
                         用户名: <input type="text"   id=${this.useInputID} /><span id=${this.usernameRuleID}>${this.usernameRule}</span>\
                         密码: <input type="password" id=${this.pwdInputID} /><span id=${this.passwordRuleID}>${this.passwordRule}</span>\
                         </div>`);
                         
        this.jqUserInoBar.css({ "display": "grid",
            "grid-template-columns": "15% 40% 45%",
            "grid-template-rows":  "50% 50%",
            "grid-row-gap": "8px",
            "grid-column-gap": "8px"
        });
        this.jqContentBar.append(this.jqUserInoBar);
        this.jqHintSpanID=CommonUtilities.getGuid();
        this.jqHintSpan=$(`<div id=${this.jqHintSpanID}>请输入用户名和密码</div>`);
        this.jqHintSpan.css({"display":"flex","margin-top":"25px",
                      'align-items':'center','width':'200px','justify-content':'center',
                      "height":"30px","font-size":"10pt","border-radius":"5px"})
        this.jqContentBar.append(this.jqHintSpan);
             
        return this.jqContentBar;
    }
    constructor(title,usernameRule,passwordRule){
        super(title);
        this.usernameRule=usernameRule;
        this.passwordRule=passwordRule;
        this.create();
        this.restetUI();
    }

   
}
//////////////////
class LoginTool extends Command{
    constructor(toolItem,toolMannager){
        super(toolItem,toolMannager);
        this.dialog=new LoginDialog("请登录","用户名不少于6位","密码长度不少于6位");
        this.dialog.addEventListener(this,USER_LOGIN_EVENT,this.loginSucceed);
    }
    loginSucceed(loginEvent)
    {
        this.toolManager.editor.username=loginEvent.response.user.name;
    }
    execute(event){
        
        this.dialog.show();
    }
}
///////////////////////////////////////
class SaveDialog extends MyDialog{
    jqDialog(){
        var me=this;
        $(`#${this.id}` ).dialog({
            autoOpen:false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
               "save":{
                    text: "保存",
                    
                    click: function() {
                        var filename=document.getElementById(me.fileInputID).value;
                        var response=me.tool.handleOkClick(filename);
                        var hintBar=document.getElementById(`${this.jqHintBarID}`);
                        
                        //if(!me.checkLogined()){
                        //    $(hintBar).css({"background-color":"#eed0d0"});
                        //    $(hintBar).html("保存文件需先登录！");
                        //    return;
                        //}
                        
                    }
                  },
               
              "Cancel":{ 
                text:"取消",
                click:function(  ){ $(`#${this.id}` ).dialog("close")},
              },
              
          }});

    }
    contentBar(){
        var  id=CommonUtilities.getGuid();
        this.jqContentBar=$(`<div id=${id}></div>`);
        this.jqContentBar.css({"display": "flex",
                           'flex-direction':'column',
                           'justify-content':'center',
                           'align-items':'center'
                        });
        this.fileInputID=CommonUtilities.getGuid();
        ;
        this.jqFileBar=$(`<div><h5>文件名</h5><input type="text"  id=${this.fileInputID} />\
                         
                         </div>`);
                         
        this.jqFileBar.css({ "display": "flex",
        'justify-content': 'space-around',  
        'flex-direction':'row' ,
        'align-items':'center'  
        });
        this.jqContentBar.append(this.jqFileBar);
        this.jqHintBarID=CommonUtilities.getGuid();
        this.jqHintBar=$(`<div id=${this.jqHintBarID}>文件将存到服务器</div>`);
        this.jqHintBar.css({"display":"flex","margin-top":"25px",
                      'align-items':'center','width':'200px','justify-content':'center',
                      "height":"30px","font-size":"10pt","border-radius":"5px"})
        this.jqContentBar.append(this.jqHintBar);
             
        return this.jqContentBar;

    }
    constructor(title,tool){
        super(title);
        this.tool=tool;
        this.create();
    }

}
//////////////////////////////////
const FILE_SAVE_EVENT ="file-save-event";
//////////////////////////////////
class SaveTool extends Command{
    constructor(toolItem,toolMannager){
        super(toolItem,toolMannager);
        this.dialog=new SaveDialog("保存文件");
        WsAgent.addEventListener(this,FILE_SAVE_EVENT,this.wsNotiyHandler);
        
    }  
    execute(event){
        this.dialog.show();
        
    }
    wsNotiyHandler(fileSaveEvent){
      console.log(fileSaveEvent);
    }
    saveFileTosever(filename){
        var stage=this.toolManager.editor.stage;
        var jsonStr=stage.toJson();
        this.toolManager.editor.fileJson=jsonStr;
        var username=this.toolManager.editor.username
        //request={task:"savefile",file:{name:`${filename}`,username:`${username}`,content:`${jsonStr}`}};
        var request={task:"savefile",file:{name:`${filename}`,username:`${username}`,content:`${jsonStr}`}};
        var jsonRequest=JSON.stringify(request);
        WsAgent.send(jsonRequest);
        
    }
    handleOkClick(filename){
      this.saveFileToServer(filename);
    }
    
    
}

class LoadTool extends Command{
    execute(event){
        var fileJson=this.toolManager.editor.fileJson;
        var canvas=this.toolManager.editor.canvas;
        var stage=this.toolManager.editor.stage; 
        return JTopo.loadFromJson(fileJson, canvas,stage);
       
    }
}
///////////////////////////////////////////
class AppendTabTool extends Command{
    
    execute(event){
        this.toolManager.editor.addTab();
    }   
}
////////////////////////////////
class UndoTool extends Command{
   
    undo(){
        var action=this.toolManager.actionManager.popUndoAction();
        if(action){action.undo();
        this.toolManager.actionManager.pushRedoAction(action);
        }
    }
    execute(event){
        this.undo();
    }
}
class RedoTool extends Command{
    
    redo(){
        var action=this.toolManager.actionManager.popRedoAction();
        if(action) {action.redo();
        this.toolManager.actionManager.pushUndoAction(action);
        }
    }
    execute(event){
        this.redo();
    }
}

//////////////////////////////////////////
class Action{
    constructor(args){
    
    this.args=args;
    }
    undo(){

    }
    redo(){
        
    }    
}
///////////////////////////
class MoveAction extends Action{
    do(){
        var x0=this.args.x0,   y0=this.args.y0;
        var x=this.args.obj.x, y=this.args.obj.y;
        this.args.obj.setLocation(x0,y0) 
        this.args.x0=x,   this.args.y0=y;
        let dx=x-x0,dy=y-y0;
        for(let i=0;this.args.obj.connectors&&i<this.args.obj.connectors.length;i++){
            let cn_x=this.args.obj.connectors[i].x,cn_y=this.args.obj.connectors[i].y;
            this.args.obj.connectors[i].setLocation(cn_x-dx,cn_y-dy);    
        }
    }
    undo(){
      this.do();
    }
    redo(){
      this.do();     
    }
}
//////////////////////
class AddAction extends Action{
    undo(){
       
        this.args.scene.remove(this.args.obj);

    }
    redo(){
       this.args.scene.add(this.args.obj); 
    }
}
//////////////////////////////
class LinkAction extends Action{
    undo(){
        var undoKeeps=this.args.undoKeeps;
        var scene=this.args.scene;
        var links=this.args.links;
        let k=links.length;
        for(let i=0;i<k;i++){
            let link=links[i];
            scene.remove(link);
            if(undoKeeps.indexOf(link.nodeA)==-1)scene.remove(link.nodeA);
            if(i==k-1&&undoKeeps.indexOf(link.nodeZ)==-1)scene.remove(link.nodeZ);
        }    
    }
    redo(){
        var undoKeeps=this.args.undoKeeps;
        var scene=this.args.scene;
        var links=this.args.links;
        let k=links.length;
        for(let i=0;i<k;i++){
            let link=links[i];
            link.nodeZ.inLinks?link.nodeZ.inLinks.indexOf(link)==-1&&nodeZ.inLinks.push(link):
                                                              link.nodeZ.inLinks=[],link.nodeZ.inLinks.push(link);
            link.nodeA.outLinks?link.nodeA.outLinks.indexOf(link)==-1&&nodeA.outLinks.push(link):
                                                              link.nodeA.outLinks=[],link.nodeA.outLinks.push(link)
            if(i==k-1&&undoKeeps.indexOf(link.nodeZ)==-1)scene.add( link.nodeZ);
            
            if(undoKeeps.indexOf(link.nodeA)==-1)  scene.add( link.nodeA);
            scene.add(link);
            
        }      
    }
}
//////////////////////////////
class ActionManager{
    constructor(){
        this.undoStack=[];
        this.redoStack=[];
    }
    pushUndoAction(action){this.undoStack.push(action)}
    popUndoAction(){return this.undoStack.pop()}
    pushRedoAction(action){this.redoStack.push(action)}
    popRedoAction(){return this.redoStack.pop()}
    

}
//JTopo.actionManager=new ActionManager();
JTopo.ActionManager=ActionManager;
JTopo.MoveAction=MoveAction;
JTopo.AddAction=AddAction;
JTopo.LinkAction=LinkAction;
  ////////////////////////////////////
  


////////////////////
class PopMenu{
    appendMenu(toolItem){
         var tool=toolItem.toolClass.getInstance(toolItem,this.toolManager)
         this.ul.appendChild(tool.getProperty("menu"));

    }
    constructor(anchor,toolManager){
        this.toolManager=toolManager;
        this.anchor=anchor;
        var ul=document.createElement("ul");
        ul.setAttribute("class","contextmenu");
        this.ul=ul;
        document.body.appendChild(ul);
        ul.visible=false;
        anchor.onclick=function(event){
               // 当前位置弹出菜单（div）
               $(".contextmenu").css({
                top: event.pageY,
                left: event.pageX
            }).show();	
        }
    }

}


//////////////////////////////////
class TabSheetsHeader{
      construct(tabContainer){
        this.tabSheetsContainer=$("<div></div>");
        this.tabSheetsContainer.addClass("navBar");
        tabContainer.append(this.tabSheetsContainer);
        this.tabList=new Array(); 
        
      }
      appendTab(tabLabel){
        var me=this;
          var tag=$(`<span id='${tabLabel}'>${tabLabel}</span>`);
          tag.addClass("navMenuCommon");
          this.tabSheetsContainer.append(tag);
          this.tagList.push(tag);
          tag[0].onclick=function(event) {
             
            $.each(me.tagList,function(index,t){
                if(tag===t) {
                    t.attr("class","navMenuCommon navMenuFocus");
                }
                else {
                    t.attr("class","navMenuCommon navMenuNotFocus");
                    
                }
            } )     
            
            }
         tag.trigger("click");
      }
      deleteTab(tagLabel){

      }
  }
  ////////////////////////////
  class TabSheetsManager{
      
     appendTab(scene){
          var me=this;
          var tag=$(`<span>'${scene.name}'</span>`);
          tag.addClass("navMenuCommon");
          this.tabSheetsContainer.append(tag);
          var sheet={tabTag:tag,tabScene:scene};
          this.tabList.push(sheet);
          tag[0].onclick=function(event) {
             
            $.each(me.tabList,function(index,sh){
                if(tag===sh.tabTag) {
                    sh.tabTag.attr("class","navMenuCommon navMenuFocus");
                    me.editor.setCurrentScene(sh.tabScene);

                }
                else {
                    sh.tabTag.attr("class","navMenuCommon navMenuNotFocus");
                    
                }
            } )     
            
            }
         tag.trigger("click");
      }
      deleteTab(){
        
      }
      
      constructor(tabContainer,editor){
          this.tabSheetsContainer=$("<div></div>");
          this.tabSheetsContainer.addClass("navBar");
          this.editor=editor;
          tabContainer.append(this.tabSheetsContainer);
          this.tabList=new Array(); 
      
      }

  }  
  var tools_config=[
    {name:"开始",caption:"开始",toolItems:[ 
                                           {  caption:"保存",
                                              icon:"save.png",
                                              tooltips:"保存",
                                              toolClass:SaveTool
                                           },

                                           { caption:"载入",
                                             icon:"load.png",
                                             tooltips:"载入",
                                             toolClass:LoadTool
                                           },
                                           { caption:"追加标签页",
                                             icon:"appendTab.png",
                                             tooltips:"追加标签页",
                                             toolClass:AppendTabTool
                                           },
                                           {  caption:"撤销",
                                             icon:"undo.gif",
                                             tooltips:"撤销",
                                             toolClass:UndoTool
                                           },

                                          {caption:"重做",
                                           icon:"redo.gif",
                                           tooltips:"载入",
                                           toolClass:RedoTool
                                           },
                                            {  caption:"文本框",
                                                icon:"text.png",
                                                tooltips:"插入文本框",
                                                toolClass:TextBoxTool
                                            },
                                            
                                            {  caption:"图片",
                                                icon:"image.png",
                                                tooltips:"插入文本框",
                                                toolClass:ImageTool
                                            },

                                            {caption:"热力系统",
                                             icon:"thermal.png", 
                                             industry:"thermal",
                                             tooltips:"热力系统",
                                             toolClass:ToolsPanel
                                            },
                                            {caption:"自然",
                                            icon:"nature.png", 
                                            industry:"nature",
                                            tooltips:"自然",
                                            toolClass:ToolsPanel
                                           }, 
                                            //one toolItem
                                            {  caption:"Link",
                                               icon:"link.png",
                                               tooltips:"Add Link",
                                               toolClass:LinkTool
                                              
                                            }
                                            ,
                                            //one toolItem
                                            {
                                             caption:"接口",
                                             //button image 
                                             icon:"connector.png",
                                             tooltips:"Add Connector",
                                             toolClass:ConnectorTool
                                            },
                                            //one toolItem
                                            {
                                                caption:"登录",
                                                icon:"login.png",
                                                tooltips:"点击登录",
                                                toolClass:LoginTool
                                            }
                                        ]},
    {name:"编辑",caption:"编辑",toolItems:[     
                                         ]} ,
    {name:"文件",caption:"文件",popmenu:true,toolItems:[ 
                                              {
                                                caption:"保存",
                                                icon:"save.png",
                                                tooltips:"保存",
                                                toolClass:SaveTool
                                              }
                                         ]}                                     

    ] ;

    ////////////////////////////// 
class ToolManager{
    currentSceneChangeEventHandler(event){
        var newScene=event.newScene;
        this.ctool&&this.ctool.clearTask();
        this.ctool=null;
        var previousScene=event.preScene;
        previousScene&&previousScene.removeAllEventListener();
        this.setSceneKeyEventHandler(newScene);

    }
    constructor(jqContainer,editor){
        this.editor=editor;
        this.jqContainer=jqContainer;
        this.TBar=$("<div id='editorToolbar'></div>"); 
        this.TBar.addClass("toolBar");
        jqContainer.append(this.TBar);
        this.actionManager=new JTopo.ActionManager();
        
        this.sceneClickHandler=null;
        this.navMenusList=new Array();
        this.toolsContainerList=new Array();
        this.editor.addEventListener(this,CURRENT_SCENE_CHANGE,this.currentSceneChangeEventHandler);
          
    }
    setCurrentTool(tool){
        this.ctool=tool;
    }
    getCurrentTool(){
        return this.ctool;
    }
    refresh(result){
        if(result==1){
           
           this.ctool.getToolBtn().style.border="none";
           this.ctool.getToolBtn().style.opacity="1.0";
           
        }
    }
    getScene(){
        return this.editor.getCurrentScene();
    }
    setCursor(cursor){
        this.editor.setCursor(cursor);
    }
    createToolGroupsContainer(){
      this.nav_bar=$("<div ></div>");
      this.toolGroupsBar=$("<div ></div>");
      this.toolGroupsBar.addClass("toolGroupBar");
      this.nav_bar.addClass("navBar");
      
      this.TBar.append(this.nav_bar);
      this.TBar.append(this.toolGroupsBar);
      
    }
    /********************/
    createMenus(toolGroup){
      var me=this;
      var navMenu=$("<span></span");
      var htmlStr=toolGroup.name;
      var navMenu=navMenu.html(htmlStr);
      navMenu.addClass("navMenuCommon");
            
      this.nav_bar.append(navMenu);
      var popMenu=new PopMenu(navMenu[0]);
           
      toolGroup.toolItems.forEach(function(toolItem) {
              
              popMenu.appendMenu(toolItem);
              
          
      })
      
  }
    //--------create tool buttons
    createToolGroup(toolGroup){
        var me=this;
        var navMenu=$("<span></span");
        var htmlStr=toolGroup.name;
        var navMenu=navMenu.html(htmlStr);
        navMenu.addClass("navMenuCommon");
        this.navMenusList.push(navMenu);
        
        
        this.nav_bar.append(navMenu);
        var toolsContainer=document.createElement("Div");
        this.toolGroupsBar.append(toolsContainer);
        $(toolsContainer).addClass("toolContainer");
        toolsContainer.style.display="none";
        
        toolGroup.toolItems.forEach(function(toolItem) {
                   let tool=toolItem.toolClass.getInstance(toolItem,me);
                   //var tool=new toolItem.toolClass(toolItem,me);
                   toolsContainer.appendChild(tool.getProperty("toolBtn"));})
        
        
        this.toolsContainerList.push(toolsContainer);
        

        navMenu[0].onclick=function(event) {
           
            $.each(me.navMenusList,function(index,menu){
                if(navMenu===menu) menu.attr("class","navMenuCommon navMenuFocus")
                else menu.attr("class","navMenuCommon navMenuNotFocus");} )     
            
            $.each(me.toolsContainerList,function(index,con){
            if(toolsContainer===con) con.style.display="block";
            else con.style.display="none"} )     }
    }
    //******************************//
   setSceneKeyEventHandler(scene){
      
      scene.keyStatus={shift:0}//0-element间自由连线，1－element间元素间水平或竖直连线
      scene.addEventListener("keydown",function(event){
       var ele=scene.currentElement;
       var cx=ele?ele.cx:null,cy=ele?ele.cy:null;
       var step=1;
       function moveConnectors(owner,dx,dy){
           if(owner.connectors){
               owner.connectors.forEach(function (cn){
                  let cx=cn.cx,cy=cn.cy;
                  cn.setCenterLocation(cx+dx,cy+dy);
               })
           }
       }
       switch(event.key){
           case "ArrowUp":
            ele&&ele.setCenterLocation(cx,cy-step) ;
            ele&&moveConnectors(ele,0,-step); 
            break;
           case "ArrowDown":
            ele&&ele.setCenterLocation(cx,cy+step);
            ele&&moveConnectors(ele,0,step);     
            break;
           case "ArrowLeft":
               ele&&ele.setCenterLocation(cx-step,cy) ;
               ele&&moveConnectors(ele,-step,0);  
               break;
           case "ArrowRight":
               ele&&ele.setCenterLocation(cx+step,cy) ;
               ele&&moveConnectors(ele,step,0);
               break;
           case "Shift":
               scene.keyStatus.shift=!scene.keyStatus.shift;
               break;
    
           default:    

       }    
      })
    }
    //******************//
    createTools(scene)
    {  var me=this;
       this.createToolGroupsContainer();         
       tools_config.forEach(function(toolGroup){
          if(toolGroup.popmenu) me.createMenus(toolGroup) ;
          else me.createToolGroup(toolGroup);

       });
       this.navMenusList[0].trigger("click");
     
    }
    
}
  