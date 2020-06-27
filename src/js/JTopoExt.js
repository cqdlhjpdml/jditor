"use strict"
import{Node_PopMenu} from './menu.js'
import{PropPanelFactory} from './ui-tools.js'
//Connector:special node can be Linked between each other.
function Connector(owner){
    Connector.prototype.initialize.apply(this,null);
    this.elementType="Connector"
    this.height=10;
    this.width=10;
    this.fillColor="125,125,125";
    this.alpha=1;
    this.owner=owner;
    this.owner_id=owner._id;
    this.setPopmenu(Node_PopMenu);
    this.serializedProperties.push("owner_id");
    
    return this;
}


Connector.prototype=new JTopo.Node();
JTopo.Connector=Connector;

/////////////////////////////////////
function CrossDot(){//十字架
  CrossDot.prototype.initialize.apply(this,null);
  this.paint=function(ctx2d){
    ctx2d.save();
    ctx2d.strokeStyle = 'pink';
    ctx2d.lineWidth = 0.5;
    ctx2d.beginPath();
    ctx2d.moveTo(this.cx, this.cy+500);// the JTopo's DisplayElement,its original point not be translated to the node's center
    ctx2d.lineTo(this.cx, this.cy-500);
    ctx2d.moveTo(this.cx+500, this.cy);
    ctx2d.lineTo(this.cx-500, this.cy);
    ctx2d.closePath();
    ctx2d.stroke();
    ctx2d.restore();
  }
  return this;
}
CrossDot.prototype=new JTopo.DisplayElement();
JTopo.CrossDot=CrossDot;
///////////////////////////////////////////////
function FreeLink(nodeA,nodeZ,text){
  FreeLink.prototype.initialize.apply(this,arguments);
  this.initialize=function(nodeA,nodeZ,text){
    
    this.showAZ=true;
    this.elementType="FreeLink";
    this.nodeA_id=nodeA._id;
    this.nodeZ_id=nodeZ._id;
    this.text=text;
    this.setPopmenu(Node_PopMenu);
    this.serializedProperties.push("nodeA_id");
    this.serializedProperties.push("nodeZ_id");

 }
this.setPreLink=function(link){this.preLink=link;}
this.setFollowLink=function(link){this.followLink=link;}
this.setCenterLocation=function(x,y){
  var x0=this.cx,y0=this.cy;
  var dx=x-x0,dy=y-y0;
  var a=this.nodeA,z=this.nodeZ;
  a.setCenterLocation(a.cx+dx,a.cy+dy)
  z.setCenterLocation(z.cx+dx,z.cy+dy)
} 
this.clickHandler = function(a) {
  if(this.showAZ==false){
    this.nodeA.visible=true;
    this.nodeZ.visible=true;
  }
  else{
    this.nodeA.visible=false;
    this.nodeZ.visible=false; 
  }
  this.showAZ=!this.showAZ;
  this.dispatchEvent("click", a)
}
this.removeFromScene=function(scene){//this function not used now
  let preLink=this.preLink;
  let followLink=this.followLink;
  scene.remove(this);
  while(preLink){
     let pre=preLink.preLink;
     scene.remove(preLink);
     preLink=pre;
  }
  while(followLink){
    let follow=followLink.followLink;
    scene.remove(followLink);
    followLink=follow;
 }
}

this.initialize(nodeA,nodeZ,text) ;

}
FreeLink.prototype=new JTopo.Link;
JTopo.FreeLink=FreeLink;
////////////////////////////////////////
JTopo.loadFromJson=function(jsonStr, canvas,stage) {
  eval("var jsonObj = " + jsonStr);
  if(!stage)
        var stage = new JTopo.Stage(canvas);
  else stage.clear();
  for (var k in jsonObj)
      "childs" != k && (stage[k] = jsonObj[k]);
  var scenes = jsonObj.childs;
  return scenes.forEach(function(a) {
      var b = new JTopo.Scene(stage);
      for (var c in a)
          "childs" != c && (b[c] = a[c]),
          "background" == c && (b.background = a[c]);
      var d = a.childs;
      d.forEach(function(a) {
          var c = null
            , t = a.elementType;
          c=JTopo.createNode(t,a,b);
          if(c)  b.add(c);
      })
  }),
  stage
}
//////////////////////////////////////
/*从JSON文件中加载时创建NODES*/
JTopo.Nodes_Tables={};
JTopo.createNode=function(nodeType,properties){
 
  var createFuns={};
  createFuns["node"]=function(){
    var node=new JTopo.Node;
    setProperyies(node,properties);
    var id=node._id;
    JTopo.Nodes_Tables[id]=node;
    return node;
  }
  createFuns["CircleNode"]=function(){
    var node=new JTopo.CircleNode;
    setProperyies(node,properties);
    var id=node._id;
    JTopo.Nodes_Tables[id]=node;
    return nodes[id];;
  }
  createFuns["TextNode"]=function(){
    var node=new JTopo.TextBox;
    setProperyies(node,properties);
    var id=node._id;
    JTopo.Nodes_Tables[id]=node;
    return node;
  }
  
  createFuns["SvgNode"]=function(){
    var selector=properties['selector'];
    var text=properties['text']
    var node=new JTopo.SvgNode(selector,text);
    setProperyies(node,properties);
    var id=node._id;
    JTopo.Nodes_Tables[id]=node;
    return node;
  }
  createFuns["Connector"]=function(){
    var owner=JTopo.Nodes_Tables[properties['owner_id']]
    var node=new JTopo.Connector(owner);
    owner.connectors.push(node);
    setProperyies(node,properties);
    var id=node._id;
    JTopo.Nodes_Tables[id]=node;
    return node;
  }
  createFuns["FreeLink"]=function(){
    var nodeA=JTopo.Nodes_Tables[properties['nodeA_id']];
    var nodeZ=JTopo.Nodes_Tables[properties['nodeZ_id']];
    var text=JTopo.Nodes_Tables[properties['text']];
    var node=new JTopo.FreeLink(nodeA,nodeZ,text);
    setProperyies(node,properties);
    var id=node._id;
    JTopo.Nodes_Tables[id]=node;
    return node;
  }
  function setProperyies(node,properties){
    for (var e in properties)
              node[e] = properties[e];
     
  }
  if(createFuns[nodeType]) return createFuns[nodeType]();
  else return null;
   
}
///////////////////////////
JTopo.Element.initialize=function(){
  this.elementType = "element",
  this.serializedProperties = ["elementType","_id"],
  this.propertiesStack = [];
  let t=(new Date).getTime();//防止ID重复
  while(t==(new Date).getTime());
  this._id = "" + (new Date).getTime()
}
//////////JTopo.TextBox:to fix the bug of JTopo.TextNode
JTopo.TextBox=function(text){
  JTopo.TextBox.prototype.initialize.apply(this,null);
  this.elementType="TextNode";
  var me=this;        
  this.dbclick(function(event){
  
    var panel=PropPanelFactory.getPropPanelInstance("属性设置",me);
    panel.show();
});
  this.text=text;
  this.paint=this.paint = function(a) {
    a.save();
    a.font=this.font;
    var w0=this.width;
    var h0=this.height;
    this.width = a.measureText(this.text).width;
    this.height = a.measureText("田").width;
    var dx=(this.width-w0)/2;
    var dy=(this.height-h0)/2;
    
    a.translate(dx,dy);//fix the bug of the JTopo.TextNode,when first caculation, get wrong this.width and this.height used in the scene's paint function
    a.beginPath();
    a.font = this.font;
    a.strokeStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")";
    a.fillStyle = "rgba(" + this.fontColor + ", " + this.alpha + ")";
    a.fillText(this.text, -this.width / 2, this.height / 2);
    a.closePath();
    a.restore();
    this.paintBorder(a);
    this.paintCtrl(a);
    this.paintAlarmText(a);
    
    
};

this.setPopmenu(Node_PopMenu);

return this;
}
JTopo.TextBox.prototype=new JTopo.TextNode();

///////////////////////////////////////////////
JTopo.Scene.prototype.setTool=function(tool){
  this.tool=tool;
}

JTopo.Scene.prototype.getTool=function(){
  return this.tool;
} 
JTopo.Scene.prototype.setEditor=function(editor){
  this.editor=editor;
}
JTopo.Scene.prototype.getEditor=function(){
  return this.editor;
} 



