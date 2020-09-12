import{Tool} from './ui-base-Tools.js'
import{Svg_Node_Property_Config,Text_Node_Property_ConfigArray} from './property.js'
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
          var ctx2d=me.toolManager.editor.canvas.getContext('2d');
          var textNode = new JTopo.TextBox('新文本框',ctx2d);
          for(let i=0;i<Text_Node_Property_ConfigArray.length;i++){
            textNode.setPropertyValue(Text_Node_Property_ConfigArray[i].propname,Text_Node_Property_ConfigArray[i].defaultValue)
          }
          textNode.caculateTextSize();
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
           var imageNode = new JTopo.EditorNode();
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
          for(let i=0;i<Svg_Node_Property_Config.length;i++){
            node.setPropertyValue(Svg_Node_Property_Config[i].propname,Svg_Node_Property_Config[i].defaultValue)
          }
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
        this.tempNode=new JTopo.EditorNode();//临时线段起点
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
        if(scene.midLinks[k-1].nodeZ instanceof JTopo.Connector)  return;
        
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
                  let connector=new JTopo.Connector(owner);
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
                  
                   let midnode=new JTopo.MidNode();
                 
                   midnode.cx=me.tempNode.cx,midnode.cy=me.tempNode.cy;
                   let link=new JTopo.FreeLink(last,midnode);
                   link.strokeColor="128,128,128"
                   midnode.visible=true;
                   link.showAZ=true;
                   scene.add(midnode);
                   scene.add(link);
                   last=midnode;
                   path.push({x:midnode.cx,y:midnode.cy});
                   let len=midLinks.length;
                   if(len>0){midLinks[len-1].setFollowLink(link);link.setPreLink(midLinks[len-1]);}
                   else link.setPreLink(null);
                   midLinks.push(link);
                   return; 
                  
                 

               }
              if(from&&scene.mouseOverelement){//this is a end connector
                  var endConnector;
                  if(scene.mouseOverelement===me.tempLink) return;
                  if(scene.mouseOverelement.elementType!="Connector"){ 
                      let owner=scene.mouseOverelement;
                      let connector=new JTopo.Connector(owner);
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
                  let link=new JTopo.FreeLink(last,endConnector);
                  link.showAZ=true;
                  link.strokeColor="128,128,128"
                  scene.add(link);
                  path.push({x:endConnector.cx,y:endConnector.cy});
                  let len=midLinks.length;
                  link.setFollowLink(null);
                  if(len>0){link.setPreLink(midLinks[len-1]);midLinks[len-1].setFollowLink(link)}
                  else link.setPreLink(null);
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
              me.tempLink=new JTopo.FreeLink(last,me.tempNode);
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
              var connector=new JTopo.Connector(owner);
              connector.setLocation(x,y); 
              scene.add(connector);
              scene.removeEventListener("click");  
              me.toolManager.refresh(TASK_END);
          }
          
          scene.addEventListener("click",mouseclickHandler);
       }  
  }
  //////////////////////////////////////
  export { TextBoxTool,ImageTool,ToolsPanel,LinkTool,ConnectorTool}; 