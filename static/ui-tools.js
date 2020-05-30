 ///////////////////////////////////

////////////////////////////////
class Tool{
    static getInstance(toolItem,toolManager){//单例模式
        if(this.instance) return this.instance;
        this.instance=new toolItem.toolClass(toolItem,toolManager);
        return this.instance;
    }
   
    activate(active,event){
       var scene=this.toolManager.getActiveScene();
       if(!active) {
            this.clearTask();
            this.toolBtn.style.border="none";
            scene.removeEventListener("click");
           
        }
        else{
          scene.setTool(this);
          
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
          var me=scene.getTool();
          var textNode = new JTopo.TextBox();
          textNode.font = 'normal 16px 宋体';
          textNode.fontColor="#303030"
          textNode.setLocation(x, y);
          scene.add(textNode);
          textNode.text='新文本框';
          var args={};
         args.obj=textNode;
         args.scene=scene;
         me.toolManager.actionManager.pushUndoAction(new JTopo.AddAction(args));
         scene.removeEventListener("click");
         me.toolManager.refresh(TASK_END);  
         scene.removeEventListener("click");
         scene.removeEventListener("click");
         scene.getTool().toolManager.refresh(TASK_END);
           
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
          var me=scene.getTool();
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
           scene.getTool().toolManager.refresh(TASK_END);
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
          var me=scene.getTool();
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
    constructor(toolItem,toolManager){
        super(toolItem,toolManager) ;
        var me=this;
        this.tempNode=new JTopo.Node();//临时线段起点
        this.tempNode.height=0;
        this.tempNode.width=0;
        this.tempNode.fillColor="100,100,100";
        this.tempNode.alpha=1;
        this.tempNode.visible=false;
        this.cross=new JTopo.CrossDot();//十字架对齐提示线;
        this.cross.visible=false;
        this.tempLink=null;//临时连线
       
    }
  
    clearTask(){
        var scene=this.toolManager.getActiveScene();
        var me=scene.getTool();
        let k=scene.midLinks.length;
        if(k==0) return;
        if(scene.midLinks[k-1].nodeZ instanceof Connector)  return;
        
        for(let i=0;i<k;i++){
            let link=scene.midLinks[i];
            scene.remove(link);
            scene.remove(link.nodeA);
            if(i==k-1) scene.remove(link.nodeZ)
        }
     scene.midLinks=null;   
     scene.remove(me.tempNode);
     me.tempLink&&scene.remove(me.tempLink);
     scene.remove(me.cross);
        
    }  
     setSceneMouseHandler(scene){
        var from=null,last=null,path=[],midLinks=[];
        var undoKeeps=[];//undoKeeps:when undo action,the connector inserted before the link shunold be keeped.
        scene.midLinks=midLinks; 
        var me=scene.getTool(); 
        function mouseclickHandler(event){
              var x=event.x;
              var y=event.y;
          
              var scene=event.scene;
             
              
              if(!from&&scene.mouseOverelement){
                scene.keyStatus.shift=1; 
                if(scene.mouseOverelement.elementType!="Connector") {//click a node its elementType is not "Connector",then create a connector first
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
                 scene.add(me.tempNode);//表示鼠标移动的临时节点
                 me.cross.visbile=true;
                 scene.add(me.cross);
                 scene.addEventListener("mousemove",mousemoveHandler);
                 return;
  
              }
  
              if(from&&!scene.mouseOverelement){
                  
                   let midnode=new JTopo.Node();
                   midnode.height=5;
                   midnode.width=5;
                   midnode.fillColor="125,125,125";
                   midnode.cx=me.tempNode.cx,midnode.cy=me.tempNode.cy;
                   let link=new FreeLink(last,midnode);
                   link.strokeColor="128,128,128"
                   midnode.visible=true;
                   link.showAZ=true;
                   scene.add(midnode);
                   scene.add(link);
                   last=midnode;
                   path.push({x:midnode.cx,y:midnode.cy});
                   midLinks.push(link);
                 
                   return; 
                  
                 

               }
              if(from&&scene.mouseOverelement){//this is a end connector
                  var endConnector;
                  if(scene.mouseOverelement===me.tempLink) return;
                  if(scene.mouseOverelement.elementType!="Connector"){ 
                      let owner=scene.mouseOverelement;
                      let connector=new Connector(owner);
                      if(scene.keyStatus.shift)
                         connector.setCenterLocation(me.tempNode.cx,me.tempNode.cy); 
                      else 
                         connector.setCenterLocation(x,y); 
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
                
                  me.toolManager.refresh(TASK_END); 
                  scene.removeEventListener("mousemove");
                  scene.removeEventListener("click");
                  me.cross.visible=false;
                  me.tempLink&&scene.remove(me.tempLink);
                  scene.remove(me.cross);
                  scene.remove(me.tempNode);
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
      
        function mousemoveHandler(event){
              var x=event.x;
              var y=event.y;
              var scene=event.scene;
                      
              if(!scene.keyStatus.shift)me.tempNode.setCenterLocation(x,y);
              else{ 
                var dx=Math.abs(x-last.cx),dy=Math.abs(y-last.cy);
                if(dx-dy>0)//水平横向移动  
                 me.tempNode.setCenterLocation(x,last.cy)
                else //垂直纵向移动
                 me.tempNode.setCenterLocation(last.cx,y)
              }  
              if(me.tempLink){scene.remove(me.tempLink)}
              me.tempLink=new JTopo.Link(last,me.tempNode);
              scene.add(me.tempLink);
             
              me.cross.setCenterLocation(x,y);
              me.cross.visible=true; 
         
                                               
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
              var me=scene.getTool()
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
 对话框有titlebar,contentbar,buttonbar由上至下三部分组成，
 上下有jq_ui生成，,中间contentbar基类默认生成“you are welcome”Div,
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
    getContentIno(){/*placeholder for future 
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
////////////////////
var Property_Config=[{propname:"borderColor",caption:"边框颜色",inputtype:"select",items:["red","white","green","pink","yellow","black","blue"]},
                     {propname:"borderStyle",caption:"线型",inputtype:"select",items:["solid","dotted","dashed","double"]},
                     {propname:"borderWidth",caption:"线宽",inputtype:"select",items:["1","2","3","4","5","6","0"]},
                     {propname:"borderRadius",caption:"圆角半径",inputtype:"select",items:["0","1","2","3","4","5","6"]},
                     {propname:"fill",caption:"填充",inputtype:"select",items:["red","white","green","pink","yellow","black","blue"]},
                     {propname:"fontFamily",caption:"字体",inputtype:"select",items:["宋体","华文仿宋","魏碑","隶书","微软雅黑","serif"]},
                     {propname:"fontSize",caption:"字号",inputtype:"select",items:["12","13","14","15","16","17","18","19","20","21","22","23","24","25"]},
                     {propname:"textPosition",caption:"文本位置",inputtype:"select",items:["left","right","top","bottom"]},
                     {propname:"text",caption:"文本内容",inputtype:"input"}
                     
                    ];
var Text_Node_Property_Config=[/* font-style, font-variant, font-weight, font-stretch, font-size, line-height, and font-famil*/
                    {propname:"fontStyle",caption:"风格",inputtype:"select",items:["normal","italic"]},
                    {propname:"fontSize",caption:"字号",inputtype:"select",items:["12px","13px","14px","15px","16px","17px","18px","19px","20px","21px","22px","23px","24px","25px"]},
                    {propname:"fontFamily",caption:"字体",inputtype:"select",items:["宋体","华文仿宋","魏碑","隶书","微软雅黑","serif"]},
                    {propname:"text",caption:"文本内容",inputtype:"input"}
                    
                   ];
//////////////////////////////////
class PropPanel extends MyDialog{
    constructor(title){
        super(title);
        this.element=null;
        this.properties=new Array();
               
    }
     //overridae
     jqDialog(){
        var me=this;
        $(`#${this.id}` ).dialog({
            close:false,
            autoOpen:false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
               "Apply":{
                    text: "应用",
                    
                    click: function() {
                      me.apply();
                    }
                },
               
              "Cancel":{ 
                text:"退出",
                click:function(  ){ 
                  $(`#${this.id}` ).dialog("close");
                  
                },
              }
          }});
              
          $(`#${this.id}`).on( "dialogopen", function(){
            me.propertiesInitialize();
                            } );
       
   
    }
    propertiesInitialize(){
       
        for(let i=0;i<this.properties.length;i++){
            let control= this.properties[i].control();
            control[0].value=this.element.getPropertyValue(this.properties[i].propertyname);
             
          }
    }
    setElement(element){
        this.element=element;
    }
    apply(){
       for(let i=0;i<this.properties.length;i++){
         this.element.setPropertyValue(this.properties[i].propertyname,this.properties[i].val());
         
       }
      
    } 
    //override
    contentBar(){
        this.jqContentBarID=CommonUtilities.getGuid();
        this.jqContentBar=$(`<div id=${this.jqContentBarID}></div>`);
        this.jqContentBar.css({"display": "grid",
        "grid-template-columns": "50% 50%",
        
        "grid-row-gap": "8px",
        "grid-column-gap": "8px"});
        var jqLabel;
       
        for( let i=0 ;i<this.propConfig.length;i++){
             let config=this.propConfig[i];
             switch(config.inputtype){
                case "select":
                    var selectListID=CommonUtilities.getGuid();
                    var jqSelectList=$(`<select id=${selectListID}></select>`);
                    jqLabel=$(`<lable for=${selectListID}>${config.caption}</label>`);
                    this.jqContentBar.append(jqLabel);
                    for(let j=0;j<config.items.length;j++) {
                        let optionvalue=config.items[j];
                        let option=$(`<option>${optionvalue}</option>`)
                        jqSelectList.append(option);
                    } 
                    this.jqContentBar.append(jqSelectList);
                    var property={propertyname:config.propname,
                        control:function(){var t=jqSelectList;return function(){return t}}(),
                        val:function(){
                         var t=jqSelectList;
                         return function(){return t[0].selectedOptions[0].value;}}()}
                    this.properties.push(property);
                    break;
                case "input":
                    var inputBoxID=CommonUtilities.getGuid();
                    var jqInputBox=$(`<input id=${inputBoxID}></input>`);
                    jqLabel=$(`<lable for=${inputBoxID}>${config.caption}</label>`);
                    this.jqContentBar.append(jqLabel);
                    this.jqContentBar.append(jqInputBox);
                    var property={propertyname:config.propname,
                        control:function(){var t=jqInputBox;return t;},
                        val:function(){
                        var t=jqInputBox;
                        return function(){return t[0].value;}}()}
                   this.properties.push(property);
                    break;
                default:
                    break;
           
             }
           
        }
      
        return this.jqContentBar;
   }
}

     
//////////////////////////////////
class TextNodePropPanel extends PropPanel{
    constructor(title){
        super(title);
        this.propConfig=Text_Node_Property_Config;
        this.create();        
    }
    apply(){
        
        var args={};
        args.obj=this.element;
        args.props={};
        args.props.text=this.element.text;
        args.props.font=this.element.font;
        args.props.fontSize=this.element.fontSize;
        var propAction=new PropertyAction(args);
        var actionManager=this.element.scene.getTool().toolManager.actionManager;
        actionManager.pushUndoAction(propAction);

        var font="";
        for(let i=0;i<this.properties.length;i++){
            switch(this.properties[i].propertyname){
                case "fontStyle":
                case "fontFamily":
                case "fontSize":
                   font=font + " " + this.properties[i].val()
                   break;
                default:
                    this.element.setPropertyValue(this.properties[i].propertyname,this.properties[i].val());
            }  
          this.element.setPropertyValue("font",font);
                 
        }
    }
       
    propertiesInitialize(){
        var fontProp=this.element.getPropertyValue("font").trim().split(" ");
        var fontProperties=[];
        for(let i=0;i<fontProp.length;i++){
            fontProperties.push(fontProp[i].trim());
        }

        for(let i=0;i<this.properties.length;i++){
            let control= this.properties[i].control();
            switch(this.properties[i].propertyname){
                case "fontStyle":
                case "fontFamily":
                case "fontSize":
                    for(let j=0;j<fontProperties.length;j++){
                        let k=this.propConfig[i].items.indexOf(fontProperties[j]);
                        if(k!=-1) {control[0].value=this.propConfig[i].items[k];break;}
                    }
                   break;
                default:
                    control[0].value=this.element.getPropertyValue(this.properties[i].propertyname);
            }
            
             
          }
    }
}

//////////////
class PropPanelFactory{
    static getPropPanelInstance(title,element){
        if(!this.panels) this.panels=new Array();
        if(this.panels[element.elementType]){
               this.panels[element.elementType].element=element;
               return this.panels[element.elementType];
        }
        switch(element.elementType){
            case "TextNode":
                var panel=new TextNodePropPanel(title);
               break;
            case "SvgNode":
                var panel=new TextNodePropPanel(title);break;

        }
        panel.element=element;
        this.panels[element.elementType]=panel;
        return panel;
      
    }

}
//////////////////////////////////////////////////////////
class OpenFileDialog extends MyDialog{
    resetUI(){
        
        this.jqSelectList.html("");
        this.jqHintBar.css({"display":"flex","margin-top":"25px",
        'align-items':'center','width':'200px','justify-content':'center',
        "height":"30px","font-size":"10pt","border-radius":"5px"});
        this.jqHintBar.html("正在加载文件列表")
       
    }

    wsNotifyFileLoadHandler(openFileEvent){
        console.log(openFileEvent);
        var fileJson=openFileEvent.response.result.content;
        this.tool.toolManager.editor.loadFileFromJson(fileJson);
        $(`#${this.id}` ).dialog("close");
        
    }

    wsNotifyFileListHandler(getFileListEvent){
        var response=getFileListEvent.response;
        var r=response.result;
        var fileList=response.fileList;
        
        if(!r.succeed) {
           
            this.jqHintBar.html("获取文件列表失败！");
            this.jqHintBar.css({"background-color":"#e0d0d0"});
            return;
        }
        
        this.jqHintBar.html("文件列表已加载！");
        this.jqHintBar.css({"background-color":"#e0d0d0"});
        for(let i=0;i<fileList.length;i++) {
           let option=$(`<option>${fileList[i].filename}</option>`)
           this.jqSelectList.append(option);
        } 
        //console.log(getFileListEvent);
     }
     //overridae
     jqDialog(){
        WsAgent.addEventListener(this,OPEN_FILE_EVENT,this.wsNotifyFileLoadHandler);
        WsAgent.addEventListener(this,GET_FILELIST_EVENT,this.wsNotifyFileListHandler);
        $(`#${this.id}` ).dialog({
            close:false,
            autoOpen:false,
            resizable: false,
            height: "auto",
            width: "auto",
            modal: true,
            buttons: {
               "open":{
                    text: "打开",
                    
                    click: function() {
                        var username=me.tool.getUsername();
                        var filename=me.jqSelectList[0].selectedOptions[0].value;
                        //request={taskname:[login|register|save|open],file:{name:username,filename:fname,folder:folder}}
                        var request={taskname:"openfile",file:{username:`${username}`,filename:`${filename}`,folder:'.'}};
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
          
          var me=this;
          $(`#${this.id}`).on( "dialogopen", function(){
                                 var taskreq={taskname:"getFileList",filter:{username:`${me.tool.getUsername()}`,folder:`.`}}
                                 var jsonReq=JSON.stringify(taskreq)
             
                                WsAgent.send(jsonReq);  
                                me.resetUI.call(me);
                            } );
       
   
    }
    //override 
    contentBar(){
        this.jqContentBarID=CommonUtilities.getGuid();
        this.jqContentBar=$(`<div id=${this.jqContentBarID}></div>`);
        this.jqContentBar.css({"display": "flex",
                           'flex-direction':'column',
                           'justify-content':'center',
                           'align-items':'center'
                        });
        this.fileListBarID=CommonUtilities.getGuid();
        ;
        this.jqFileListBar=$(`<div>文件名\
                         
                         </div>`);
        this.jqFileListBar.css({ "display": "flex",
        'justify-content': 'space-around',  
        'flex-direction':'row' ,
        'align-items':'center'  
        });
        
        this.selectListID=CommonUtilities.getGuid();
        this.jqSelectList=$(`<select id=${this.selectListID}></select>`);
        this.jqFileListBar.append(this.jqSelectList);
        this.jqContentBar.append(this.jqFileListBar);
       
        
        this.jqHintBarID=CommonUtilities.getGuid();
        this.jqHintBar=$(`<div id=${this.jqHintBarID}>正在加载文件列表</div>`);
        this.jqHintBar.css({"display":"flex","margin-top":"25px",
                      'align-items':'center','width':'200px','justify-content':'center',
                      "height":"30px","font-size":"10pt","border-radius":"5px"})
        this.jqContentBar.append(this.jqHintBar);
        
        
             
        return this.jqContentBar;

    }
    loadFileList(fileListEvent){
      



    }
    constructor(title,tool){
        super(title);
        this.tool=tool;
        this.create();
        

    }


}
/////////////////////////
class OpenFileTool extends Command{
    constructor(toolItem,toolMannager){
        super(toolItem,toolMannager);
        this.dialog=new OpenFileDialog("打开文件",this);
               
    }  
    execute(event){
        this.dialog.show();
       
    }
    wsNotiyHandler(wsTaskEvent){
        //placehoder for future;
      
    }
  
    getUsername(){
        return this.toolManager.editor.username;
    }
    
   
}
////////////////////////

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
                        var request={taskname:"login",user:{name:`${username}`,pwd:`${pwd}`}};
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
    restetUI(){
        let jqHintBar=document.getElementById(`${this.jqHintBarID}`);
        
        $(jqHintBar).css({"background-color":"#d0d0d0"});
        $(jqHintBar).html("文件将存到服务器");
        
    }
    wsNotiyHandler(wsTaskEvent){
        var response=wsTaskEvent.response;
        var hintSBar=document.getElementById(`${this.jqHintBarID}`);
        //console.log(wsTaskEvent);
        var response=wsTaskEvent.response;
       
        if(response.result.succeed==true){
            $(hintSBar).css({"background-color":"#e0d0d0"});
            $(hintSBar).html(response.result.msg+"，对话框将自动关闭");
            this.dispatchEvent(wsTaskEvent);
                       
            setTimeout(()=>{
                          $(`#${this.id}` ).dialog("close")
                             
                           },2000);
        }
        else{
            $(hintSBar).css({"background-color":"#eed0d0"});
            $(hintSBar).html(response.result.msg);
        }
    }
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
                        var username=me.tool.getUsername();
                        var content=me.tool.getContent();
                        var date=new Date();
                        var time=date.toLocaleDateString()+date.toLocaleTimeString();
                        var ip="fakeIP";//real IP will be set by server;
                        var folder='.';
                        
                        var request={taskname:"savefile",file:{filename:`${filename}`,username:`${username}`,content:`${content}`,folder:`${folder}`},time:`${time}`,ip:`${ip}`};
                        var jsonRequest=JSON.stringify(request);
                        WsAgent.send(jsonRequest);
                                               
                    }
                  },
               
              "Cancel":{ 
                text:"取消",
                click:function(  ){ $(`#${this.id}` ).dialog("close")},
              },
              
          }});
      $(`#${this.id}`).on( "dialogclose", function(){me.restetUI.call(me)} )
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
    constructor(title,savetool){
        super(title);
        this.tool=savetool;
        this.create();
        WsAgent.addEventListener(this,FILE_SAVE_EVENT,this.wsNotiyHandler);
        this.restetUI();
    }
    

}
//////////////////////////////////

//////////////////////////////////
class SaveTool extends Command{
    constructor(toolItem,toolMannager){
        super(toolItem,toolMannager);
        this.dialog=new SaveDialog("保存文件",this);
        this.dialog.addEventListener(this,FILE_SAVE_EVENT,this.wsNotiyHandler,)       
    }  
    execute(event){
        this.dialog.show();
        
    }
    wsNotiyHandler(wsTaskEvent){
        //placehoder for future;
      
    }
    getContent(){
        var stage=this.toolManager.editor.stage;
        var jsonStr=stage.toJson();
        return jsonStr; 
    }
    getUsername(){
        return this.toolManager.editor.username;
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
        this.toolManager.editor.createTab();
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
/////////////////////////////
class PropertyAction extends Action{
    
    do(){
        var props={};
        for (var propname in this.args.props) {
            props[propname]=this.args.obj.getPropertyValue(propname);
            this.args.obj.setPropertyValue(propname,this.args.props[propname])
        }
        this.args.props=props;
        

    }
    undo(){
      this.do();
    }
    redo(){
      this.do();     
    }
}
///////////////////////////////

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

 