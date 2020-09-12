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
/////////////////////////////////
class RemoveAction extends Action{
    undo(){
        
        this.args.scene.add(this.args.obj);

    }
    redo(){
       this.args.scene.remove(this.args.obj); 
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
JTopo.ActionManager=ActionManager;
JTopo.MoveAction=MoveAction;
JTopo.AddAction=AddAction;
JTopo.LinkAction=LinkAction;
export {PropertyAction,RemoveAction,AddAction}