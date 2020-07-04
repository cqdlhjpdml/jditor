"use strict"
import{CommonUtilities} from './common.js'
import{RemoveAction,MyDialog} from './ui-tools.js'
var AlertMsg={disableToDelete_Title_CN:"警告",disableToDelete_CN:"不能删除包含连接端口的符号"}
class AlertDialog extends MyDialog{
    //overridable 
    contentBar(){
        this.jqContentBar=$(`<div>${AlertMsg.disableToDelete_CN}</div>`);
        return this.jqContentBar;
    }
}

class PopMenu{
    appendMenu(menuconfig){
      var menuid=CommonUtilities.getGuid();
      var alink=$(`<a id=${menuid}>${menuconfig.caption}</a>`)
      var jqmenu=$(`<li></li>`);
      jqmenu.append(alink)
      this.jqUl.append(jqmenu);
      var me=this;
      alink[0].onclick=function(event){menuconfig.handler(me.targetEvent);me.hide()}
    }
    createMenus(){
        var me=this;     
        this.menuConfigs.forEach(function(menuconig) {
                me.appendMenu(menuconig);
        })
        
    }
    setTargetEvent(event){this.targetEvent=event;}
    showAt(x,y){
        $(`#${this.id}`).css({
            top: y,
            left: x
        }).show();	   
    }
    
    hide(){
        $(`#${this.id}`).hide();	  
    }
    
    constructor(menuConfigs){
        this.menuConfigs=menuConfigs;
        this.id=CommonUtilities.getGuid();
        this.jqUl=$(`<ul id=${this.id}></ul>`);
        this.jqUl[0].setAttribute("class","contextmenu");
        this.createMenus();
        document.body.appendChild(this.jqUl[0]);
      
    }

}
function deleteCallback(targetEvent){
    var scene=targetEvent.scene;
    if(!targetEvent.target) return;
    if(targetEvent.target.connectors)
       if(targetEvent.target.connectors.count>0){
        var dialog=new AlertDialog(AlertMsg.disableToDelete_Title_CN);
        dialog.show();
        return;
       }

    var target=targetEvent.target;
    var args={};args.obj=target;
    args.scene=scene;
    var revmoveAction=new RemoveAction(args);
    JTopo.editor.toolManager.addUndoAction(revmoveAction)
    //if(target.removeFromScene) target.removeFromScene(scene);
    
    //else scene.remove(target);
    scene.remove(target);
   }
var Node_PopMenu_Config=[{caption:"删除",icon:"delete.png",tooltips:"删除",handler:deleteCallback}]
var Node_PopMenu=new PopMenu(Node_PopMenu_Config);
export{Node_PopMenu}