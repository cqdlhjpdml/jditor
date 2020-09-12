import {FILE_SAVE_EVENT,USER_LOGIN_EVENT} from './common.js'
import{Command} from './ui-base-tools.js'
import{LoginDialog,SaveDialog,OpenFileDialog} from './ui-dialogs.js'
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

export{SaveTool,OpenFileTool, AppendTabTool,UndoTool,RedoTool,LoginTool}